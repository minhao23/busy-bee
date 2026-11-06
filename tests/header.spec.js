import { test, expect } from "./fixtures.js";

for (const width of [320, 1440]) {
  test.describe(`App header at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 } });
    test("keeps branding secondary and the date aligned across screens", async ({ page, board }, testInfo) => {
      const header = page.locator(".app-header");
      const brand = header.getByRole("heading", { name: "Busy Bee" });
      const date = header.locator("time");
      await expect(brand).toBeVisible();
      const bee = brand.locator("svg");
      await expect(bee).toBeVisible();
      await expect(bee).toHaveAttribute("aria-hidden", "true");
      await expect(bee).toHaveAttribute("focusable", "false");
      await expect(bee).toHaveCSS("width", "24px");
      await expect(bee).toHaveCSS("height", "24px");
      await expect(date).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}$/);
      const sizes = await page.evaluate(() => ({
        brand: parseFloat(getComputedStyle(document.querySelector(".app-title")).fontSize),
        title: parseFloat(getComputedStyle(document.querySelector(".todo-title")).fontSize),
      }));
      expect(sizes.brand).toBeLessThan(sizes.title);
      const branding = await brand.boundingBox();
      const dateBounds = await date.boundingBox();
      expect(branding.x + branding.width).toBeLessThan(dateBounds.x);
      expect(dateBounds.x + dateBounds.width).toBeLessThanOrEqual(width);
      await page.screenshot({ path: testInfo.outputPath("tasks-header.png") });
      await board.focus();
      await expect(brand).toBeVisible();
      await expect(date).toBeVisible();
      const focusHeading = page.getByRole("heading", { name: "Focus timer", exact: true });
      await expect(focusHeading).toHaveClass("sr-only");
      const headingBounds = await focusHeading.boundingBox();
      expect(headingBounds.width).toBeLessThanOrEqual(1);
      expect(headingBounds.height).toBeLessThanOrEqual(1);
      await page.screenshot({ path: testInfo.outputPath("focus-header.png") });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  });
}
