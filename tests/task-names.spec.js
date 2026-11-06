import { test, expect } from "./fixtures.js";

const unbroken = "ahhftiffgggyfyufftodrydryfdr86tiuyhjkbjvgcfyt7yilujkhvgfyt67yuijkhbhgfyt6o78yiuljkhbhvgfjytyg7iu".repeat(2);
const sentence = "Prepare the project proposal, review the research notes, and send the revised schedule to the team before the planning meeting. ".repeat(2);

test("name disclosure adapts to resizing and enlarged text", async ({ page, board }) => {
  const title = "Review the project proposal and send the final meeting schedule to everyone on the team.";
  board.rows()[0].task_name = title;
  await page.setViewportSize({ width: 390, height: 900 });
  await page.reload();
  await board.tasks();
  const card = board.card(1);
  await expect(card.locator(".task-name-toggle")).toHaveAttribute("aria-expanded", "false");
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(card.locator(".task-name-toggle")).toHaveCount(0);
  await page.setViewportSize({ width: 320, height: 900 });
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await expect(card.locator(".task-name-toggle")).toHaveAttribute("aria-expanded", "false");
  await card.locator(".task-name-toggle").click();
  await expect(card.locator(".task-name-toggle")).toHaveAttribute("aria-expanded", "true");
  expect(await card.locator(".task-name").evaluate(element => element.clientHeight >= element.scrollHeight - 1)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  expect(board.writes).toHaveLength(0);
});

for (const width of [320, 390, 768, 1440]) {
  test.describe(`Task names at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    test("long names expand explicitly and short names stay compact", async ({ page, board }, testInfo) => {
      const original = board.rows()[0];
      original.task_name = unbroken;
      board.rows().push(
        { ...original, id: 2, importance: 3, task_name: "ho" },
        { ...original, id: 3, importance: 2, task_name: sentence },
      );
      await page.reload();
      await board.tasks();
      await expect(board.card(1).locator(".task-name")).toHaveText(unbroken);
      await page.evaluate(() => document.fonts.ready);
      for (const id of [1, 3]) {
        const card = board.card(id);
        const toggle = card.locator(".task-name-toggle");
        await expect(toggle).toHaveAttribute("aria-expanded", "false");
        await expect(toggle).toContainText("Show more");
        const preview = await card.locator(".task-name").boundingBox();
        expect(preview.height).toBeLessThanOrEqual(77);
        expect((await card.boundingBox()).height).toBeLessThan(170);
        const check = await card.locator(".task-check").boundingBox();
        const handle = await card.locator(".task-move").boundingBox();
        expect(check.y).toBe(handle.y);
        expect(check.y).toBeGreaterThanOrEqual(preview.y + preview.height);
        expect(check.width).toBe(44);
        expect(handle.width).toBe(44);
      }
      const short = board.card(2);
      await expect(short.locator(".task-name-toggle")).toHaveCount(0);
      await expect(short.locator(".task-name")).toHaveText("ho");
      expect((await short.boundingBox()).height).toBeLessThanOrEqual(90);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.screenshot({ path: testInfo.outputPath("mixed-names.png"), fullPage: true });

      const toggle = board.card(1).locator(".task-name-toggle");
      await toggle.focus();
      await page.keyboard.press("Enter");
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      const name = board.card(1).locator(".task-name");
      await expect(name).toHaveText(unbroken);
      expect(await name.evaluate(element => element.clientHeight >= element.scrollHeight - 1)).toBe(true);
      await board.roundTrip();
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(board.writes).toHaveLength(0);
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "false");

      await board.mutation(async () => {
        await board.card(1).getByRole("checkbox").click();
      }, async () => {
        await page.locator(".completed").evaluate(element => { element.open = true; });
        const completed = board.card(1);
        await expect(completed.getByRole("checkbox")).toBeChecked();
        await expect(completed.locator(".task-name")).toHaveText(unbroken);
        const clipped = await completed.locator(".task-name").evaluate(element => element.scrollHeight > element.clientHeight + 1);
        if (clipped) await expect(completed.locator(".task-name-toggle")).toHaveAttribute("aria-expanded", "false");
        else await expect(completed.locator(".task-name-toggle")).toHaveCount(0);
      });
    });
  });
}
