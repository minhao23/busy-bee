import { test, expect } from "./fixtures.js";

for (const width of [320, 1440]) {
  test.describe(`Compact empty groups at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 } });
    test("empty groups keep their labels without reserved task space", async ({ page, board }, testInfo) => {
      await page.evaluate(() => document.fonts.ready);
      const occupied = page.locator('[data-quadrant="1"]');
      const empty = page.locator('.quadrant[data-empty="true"]');
      await expect(empty).toHaveCount(3);
      const occupiedHeight = (await occupied.boundingBox()).height;
      for (const group of await empty.all()) {
        await expect(group.locator("h3")).toBeVisible();
        await expect(group.locator(".quadrant-header p")).toBeVisible();
        await expect(group.locator(".quadrant-count")).toHaveText("0");
        expect((await group.locator(".tasks-list").boundingBox()).height).toBe(0);
        expect((await group.boundingBox()).height).toBeLessThan(occupiedHeight - 50);
      }
      await expect(page.getByText("No tasks yet", { exact: true })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.screenshot({ path: testInfo.outputPath("one-task.png") });
      expect(board.writes).toHaveLength(0);
    });
  });
}

for (const input of ["mouse", "touch"]) {
  test(`${input} dragging into a compact group does not resize the target and persists`, async ({ page, board }) => {
    const destination = page.locator('[data-quadrant="2"]');
    const bounds = await destination.boundingBox();
    const handle = await board.manage().boundingBox();
    const start = { x: handle.x + handle.width / 2, y: handle.y + handle.height / 2 };
    const end = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const session = input === "touch" ? await page.context().newCDPSession(page) : null;
    try {
      await board.mutation(async () => {
        if (session) {
          await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [start] });
          await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [end] });
        } else {
          await page.mouse.move(start.x, start.y);
          await page.mouse.down();
          await page.mouse.move(end.x, end.y, { steps: 8 });
        }
        await expect(destination.getByText("Drop here", { exact: true })).toBeVisible();
        expect(await destination.boundingBox()).toEqual(bounds);
        if (session) await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        else await page.mouse.up();
      }, async () => {
        await expect(destination).toHaveAttribute("data-empty", "false");
        await expect(destination.locator('[data-task-id="1"]')).toBeVisible();
        await expect(page.locator('[data-quadrant="1"]')).toHaveAttribute("data-empty", "true");
        expect(board.rows()[0].importance).toBe(2);
      });
    } finally {
      await session?.detach();
    }
  });
}
