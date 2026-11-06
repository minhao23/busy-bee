import { test, expect } from "./fixtures.js";

const assertFits = async page => {
  const bounds = await page.locator(".timer-controls").boundingBox();
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(page.viewportSize().height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);
};

test.describe("Compact Telegram desktop popup", () => {
  test.use({
    viewport: { width: 400, height: 645 },
    telegramClient: { platform: "tdesktop", version: "8.0", height: 645, fullscreenAvailable: true },
  });

  test("requests fullscreen once and reflows with accessible controls across popup widths", async ({ page, board }, testInfo) => {
    await board.focus();
    await expect(page.locator(".app")).toHaveAttribute("data-telegram-desktop", "true");
    const calls = await page.evaluate(() => window.__telegramViewportCalls);
    expect(calls.expand).toBeGreaterThan(0);
    expect(calls.fullscreen).toBe(1);
    expect(await page.locator(".tab-navigation").evaluate(element => getComputedStyle(element).position)).toBe("static");
    await assertFits(page);
    await page.screenshot({ path: testInfo.outputPath("compact-focus.png"), fullPage: true });
    for (const width of [320, 760, 1023]) {
      await page.setViewportSize({ width, height: 645 });
      await assertFits(page);
      await board.tasks();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await board.focus();
    }
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await board.roundTrip();
    await board.focus();
    await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  });

  test("adapts to a changed stable viewport and Telegram safe areas", async ({ page, board }) => {
    await board.focus();
    const previous = await page.locator(".timer-circle").boundingBox();
    await page.evaluate(() => {
      const webApp = window.Telegram.WebApp;
      webApp.viewportStableHeight = 560;
      webApp.safeAreaInset = { top: 12 };
      webApp.contentSafeAreaInset = { top: 32, bottom: 16 };
      webApp.emit("viewportChanged");
      webApp.emit("contentSafeAreaChanged");
    });
    await expect(page.locator(".app-shell")).toHaveCSS("padding-top", "44px");
    const next = await page.locator(".timer-circle").boundingBox();
    expect(next.width).toBeLessThan(previous.width);
    await assertFits(page);
    await board.tasks();
    await expect(board.card(1)).toBeVisible();
  });

  test("task changes still persist inside the compact popup", async ({ page, board }) => {
    await board.mutation(async () => {
      await board.manage().click();
      await board.card(1).getByRole("combobox").selectOption("3");
    }, async () => {
      await expect(page.locator('[data-quadrant="3"] [data-task-id="1"]')).toBeVisible();
      expect(board.rows()[0].importance).toBe(3);
    });
  });
});

for (const client of [
  { name: "older macOS client", platform: "macos", version: "7.0", fullscreenAvailable: true, expectedCalls: 0 },
  { name: "desktop client without fullscreen API", platform: "tdesktop", version: "8.0", expectedCalls: 0 },
  { name: "desktop client rejecting fullscreen", platform: "tdesktop", version: "8.0", fullscreenAvailable: true, fullscreenThrows: true, expectedCalls: 1 },
]) {
  test.describe(client.name, () => {
    test.use({ viewport: { width: 400, height: 645 }, telegramClient: { ...client, height: 645 } });
    test("keeps the compact fallback usable", async ({ page, board }) => {
      await board.focus();
      await expect(page.locator(".app")).toHaveAttribute("data-telegram-desktop", "true");
      expect(await page.evaluate(() => window.__telegramViewportCalls.fullscreen)).toBe(client.expectedCalls);
      await assertFits(page);
      await page.getByRole("button", { name: "Start", exact: true }).click();
      await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
    });
  });
}

for (const platform of ["android", "ios"]) {
  test.describe(`Approved ${platform} layout`, () => {
    test.use({
      viewport: { width: 390, height: 844 },
      telegramClient: { platform, version: "8.0", fullscreenAvailable: true },
    });
    test("retains phone navigation and does not request fullscreen", async ({ page, board }) => {
      await board.focus();
      await expect(page.locator(".app")).not.toHaveAttribute("data-telegram-desktop");
      expect(await page.evaluate(() => window.__telegramViewportCalls.fullscreen)).toBe(0);
      await expect(page.locator(".tab-navigation")).toHaveCSS("position", "fixed");
      await expect.poll(async () => (await page.locator(".timer-circle").boundingBox()).width).toBeGreaterThan(300);
      await expect(page.locator(".app-shell")).toHaveCSS("padding-bottom", "100px");
    });
  });
}
