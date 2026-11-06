import { test, expect } from "./fixtures.js";

const expectTimerFits = async page => {
  await expect.poll(async () => {
    const circle = await page.locator(".timer-circle").boundingBox();
    const controls = await page.locator(".timer-controls").boundingBox();
    const navigation = await page.locator(".tab-navigation").boundingBox();
    return circle.y >= 0 && circle.x >= 0
      && circle.x + circle.width <= page.viewportSize().width
      && circle.y + circle.height <= controls.y
      && controls.y + controls.height <= navigation.y - 8;
  }).toBe(true);
};

for (const [width, height] of [[320, 568], [360, 640], [390, 664], [390, 844], [430, 932], [600, 645], [759, 700]]) {
  test.describe(`Narrow focus ${width}x${height}`, () => {
    test.use({ viewport: { width, height } });
    test("circle and actions fit above navigation on first open", async ({ page, board }, testInfo) => {
      await board.focus();
      await page.evaluate(() => document.fonts.ready);
      await expectTimerFits(page);
      await expect(page.locator(".timer-circle")).toHaveCSS("aspect-ratio", "1 / 1");
      const circle = await page.locator(".timer-circle").boundingBox();
      const time = await page.getByRole("timer").boundingBox();
      const edit = await page.getByRole("button", { name: "Custom timer", exact: true }).boundingBox();
      const modes = await page.locator(".mode-selector").boundingBox();
      expect(Math.abs(time.x + time.width / 2 - circle.x - circle.width / 2)).toBeLessThan(1);
      expect(Math.abs(time.y + time.height / 2 - circle.y - circle.height / 2)).toBeLessThan(20);
      expect(edit.y).toBeGreaterThanOrEqual(modes.y + modes.height);
      expect(edit.x).toBeGreaterThan(circle.x + circle.width / 2);
      expect(edit.height).toBeGreaterThanOrEqual(44);
      await page.screenshot({ path: testInfo.outputPath("focus.png") });
      await page.getByRole("button", { name: "Start", exact: true }).click();
      await board.roundTrip();
      await board.focus();
      await expectTimerFits(page);
      await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
    });
  });
}

test.describe("Height-aware focus", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("uses a prominent circle and recomputes after resizing and opening custom fields", async ({ page, board }) => {
    await board.focus();
    await expect.poll(async () => (await page.locator(".timer-circle").boundingBox()).width).toBeGreaterThan(300);
    const initialWidth = (await page.locator(".timer-circle").boundingBox()).width;
    await page.setViewportSize({ width: 390, height: 600 });
    await expectTimerFits(page);
    await expect.poll(async () => (await page.locator(".timer-circle").boundingBox()).width).toBeLessThan(initialWidth);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Custom timer", exact: true }).click();
    await expect(page.getByLabel("Minutes", { exact: true })).toBeVisible();
    await expectTimerFits(page);
  });

  test("enlarged text remains scrollable without horizontal overflow", async ({ page, board }) => {
    await board.focus();
    await page.evaluate(() => { document.documentElement.style.fontSize = "32px"; });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  });
});
