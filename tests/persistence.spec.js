import { test, expect } from "./fixtures.js";

const move = async (board, importance) => {
  await board.manage().click();
  await board.card(1).getByRole("combobox").selectOption(String(importance));
};

test("adding a task persists exactly once across navigation and reloads", async ({ page, board }) => {
  await page.getByRole("combobox", { name: "Priority for new task" }).selectOption("2");
  await board.mutation(async () => {
    await page.getByRole("textbox", { name: "Task name" }).fill("Persistence added");
    await page.getByRole("button", { name: "Add task", exact: true }).click();
  }, async () => {
    await expect(page.locator('[data-quadrant="2"] [data-task-id="2"]')).toBeVisible();
    expect(board.rows().filter(row => row.task_name === "Persistence added")).toHaveLength(1);
  });
});

test("moving a task persists and updates dashboard priority", async ({ page, board }) => {
  await board.mutation(() => move(board, 3), async () => {
    await expect(page.locator('[data-quadrant="3"] [data-task-id="1"]')).toBeVisible();
    expect(board.rows()[0].importance).toBe(3);
    await board.focus();
    await expect(page.locator("#focus-panel .upcoming-task")).toContainText("Handle soon");
    await board.tasks();
  });
});

test("completion and reopening persist and synchronize dashboard priorities", async ({ page, board }) => {
  await board.mutation(() => board.card(1).getByRole("checkbox").click(), async () => {
    await expect(page.locator(".completed [data-task-id='1']")).toHaveCount(1);
    await expect(page.locator(".quadrants-grid [data-task-id='1']")).toHaveCount(0);
    expect(board.rows()[0].finished_at).toBeTruthy();
    await board.focus();
    await expect(page.locator("#focus-panel")).not.toContainText("Persistence original");
    await board.tasks();
  });
  await board.mutation(async () => {
    const details = page.locator(".completed");
    if (await details.getAttribute("open") === null) await details.locator("summary").click();
    await board.card(1).getByRole("checkbox").click();
  }, async () => {
    await expect(page.locator('[data-quadrant="1"] [data-task-id="1"]')).toBeVisible();
    expect(board.rows()[0].finished_at).toBeNull();
    await board.focus();
    await expect(page.locator("#focus-panel")).toContainText("Persistence original");
    await board.tasks();
  });
});

test("deleted tasks stay absent after navigation and reloads", async ({ page, board }) => {
  await board.mutation(async () => {
    await board.manage().click();
    await board.card(1).getByRole("button", { name: "Delete task", exact: true }).click();
  }, async () => {
    await expect(board.card(1)).toHaveCount(0);
    expect(board.rows()).toHaveLength(0);
    await expect(page.locator('.quadrant[data-empty="true"]')).toHaveCount(4);
    await expect(page.getByText("No tasks yet", { exact: true })).toHaveCount(1);
    expect((await page.locator(".quadrants-grid").boundingBox()).height).toBeLessThan(280);
    await expect(page.locator(".quadrant-empty-state")).toHaveCount(0);
    await board.focus();
    await expect(page.locator("#focus-panel")).not.toContainText("Persistence original");
    await board.tasks();
  });
});

test("a rejected move rolls back rather than appearing saved", async ({ page, board }) => {
  await board.mutation(() => move(board, 4), async () => {
    await expect(page.locator('[data-quadrant="1"] [data-task-id="1"]')).toBeVisible();
    expect(board.rows()[0].importance).toBe(1);
  }, { fail: true, errorText: "Priority wasn't saved" });
});

test("rejected completion leaves the original task active", async ({ page, board }) => {
  await board.mutation(() => board.card(1).getByRole("checkbox").click(), async () => {
    await expect(page.locator(".quadrants-grid [data-task-id='1']")).toBeVisible();
    expect(board.rows()[0].finished_at).toBeNull();
  }, { fail: true, errorText: "Task wasn't updated" });
});

test("rejected deletion does not remove the task", async ({ board }) => {
  await board.mutation(async () => {
    await board.manage().click();
    await board.card(1).getByRole("button", { name: "Delete task", exact: true }).click();
  }, async () => {
    await expect(board.card(1)).toBeVisible();
    expect(board.rows()).toHaveLength(1);
  }, { fail: true, errorText: "Task wasn't deleted" });
});

test("draft text and selected priority survive screen switches without writes", async ({ page, board }) => {
  await page.getByRole("textbox", { name: "Task name" }).fill("Unsaved draft");
  await page.getByRole("combobox", { name: "Priority for new task" }).selectOption("2");
  await board.roundTrip();
  await expect(page.getByRole("textbox", { name: "Task name" })).toHaveValue("Unsaved draft");
  await expect(page.getByRole("combobox", { name: "Priority for new task" })).toHaveValue("2");
  expect(board.writes).toHaveLength(0);
});
