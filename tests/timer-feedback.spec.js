import { test, expect } from "./fixtures.js";

const themes = [
  ["Work", "work", "rgb(232, 197, 149)"],
  ["Short Break", "shortBreak", "rgb(198, 228, 204)"],
  ["Long Break", "longBreak", "rgb(197, 217, 238)"],
];

test("mode color changes immediately without changing the app branding", async ({ page, board }, testInfo) => {
  await board.focus();
  for (const [label, mode, color] of themes) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page.locator(".pomodoro-timer")).toHaveAttribute("data-mode", mode);
    await expect(page.locator(".timer-mode")).toHaveCSS("color", color);
    await expect(page.locator(".progress-ring-background")).toHaveCSS("stroke", color);
    await expect(page.locator(".progress-ring-fill")).toHaveCSS("stroke", color);
    await expect(page.locator(".control-button.primary")).toHaveCSS("background-color", color);
    await expect(page.locator(".app-title svg")).toHaveCSS("color", "rgb(232, 197, 149)");
    await expectModeContrast(page);
    await page.screenshot({ path: testInfo.outputPath(`${mode}.png`) });
  }
});

test("duration editing does not change the timer until a field changes", async ({ page, board }) => {
  await board.focus();
  const edit = page.getByRole("button", { name: "Custom timer", exact: true });
  await expect(page.getByText("Custom duration", { exact: true })).toHaveCount(0);
  expect(await edit.evaluate(element => !!element.closest(".timer-display") && !element.closest(".timer-text"))).toBe(true);
  await edit.click();
  await expect(edit).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByLabel("Minutes", { exact: true })).toHaveValue("25");
  await expect(page.locator(".pomodoro-timer")).toHaveAttribute("data-mode", "work");
  await edit.click();
  await expect(page.locator("#duration-settings")).toHaveCount(0);
  await expect(page.getByRole("timer")).toHaveText("25:00");
  await edit.click();
  await page.getByLabel("Minutes", { exact: true }).selectOption("12");
  await page.getByLabel("Seconds", { exact: true }).selectOption("30");
  await edit.click();
  await expect(page.getByRole("timer")).toHaveText("12:30");
  await expect(page.locator(".pomodoro-timer")).toHaveAttribute("data-mode", "custom");
  await board.roundTrip();
  await board.focus();
  await expect(page.getByRole("timer")).toHaveText("12:30");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(edit).toBeDisabled();
});

test("elapsed progress and running/paused state survive screen switches and reset", async ({ page, board }) => {
  await board.focus();
  await page.clock.install();
  const ring = page.locator(".progress-ring-fill");
  const initial = Number(await ring.getAttribute("stroke-dashoffset"));
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await board.tasks();
  await page.clock.fastForward(5 * 60 * 1000);
  await board.focus();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  await expect(page.getByRole("timer")).toHaveText("20:00");
  const advanced = Number(await ring.getAttribute("stroke-dashoffset"));
  expect(advanced).toBeCloseTo(initial * .8, 2);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await board.tasks();
  await page.clock.fastForward(60 * 1000);
  await board.focus();
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible();
  await expect(page.getByRole("timer")).toHaveText("20:00");
  expect(Number(await ring.getAttribute("stroke-dashoffset"))).toBe(advanced);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  expect(Number(await ring.getAttribute("stroke-dashoffset"))).toBe(initial);
  expect(board.writes).toHaveLength(0);
});

test("completed work sessions fill the cycle and select the correct break color", async ({ page, board }) => {
  await board.focus();
  await page.clock.install();
  for (let completed = 1; completed <= 4; completed++) {
    await page.getByRole("button", { name: "Work", exact: true }).click();
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await page.clock.fastForward(25 * 60 * 1000);
    await expect(page.getByRole("button", { name: "Finished", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Dismiss", exact: true }).click();
    await expect(page.locator(".session-dots .filled")).toHaveCount(completed);
    await expect(page.getByRole("group", { name: `${completed} of 4 work sessions before a long break` })).toBeVisible();
    await expect(page.locator(".pomodoro-timer")).toHaveAttribute("data-mode", completed === 4 ? "longBreak" : "shortBreak");
  }
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.clock.fastForward(15 * 60 * 1000);
  await expect(page.getByRole("button", { name: "Finished", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Dismiss", exact: true }).click();
  await expect(page.locator(".session-dots .filled")).toHaveCount(0);
  await expect(page.locator(".pomodoro-timer")).toHaveAttribute("data-mode", "work");
});

test("custom validation and alarm dismissal work with duration editing", async ({ page, board }) => {
  await board.focus();
  await page.clock.install();
  await page.getByRole("button", { name: "Custom timer", exact: true }).click();
  await page.getByLabel("Minutes", { exact: true }).selectOption("0");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("valid time");
  await page.getByLabel("Seconds", { exact: true }).selectOption("1");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.clock.fastForward(1000);
  await expect(page.getByRole("button", { name: "Finished", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Custom timer", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Dismiss", exact: true }).click();
  await expect(page.getByRole("timer")).toHaveText("25:00");
});

async function expectModeContrast(page) {
  const ratios = await page.evaluate(() => {
    const rgb = color => color.match(/[\d.]+/g).slice(0, 3).map(Number);
    const luminance = channels => channels.map(c => {
      const value = c / 255;
      return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    }).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
    const canvas = rgb(getComputedStyle(document.querySelector(".app")).backgroundColor);
    return [...document.querySelectorAll(".mode-button, .tab-button, .custom-button, .timer-mode, .control-button.primary")].map(element => {
      let background = canvas;
      for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
        const color = getComputedStyle(ancestor).backgroundColor;
        if (color !== "rgba(0, 0, 0, 0)") { background = rgb(color); break; }
      }
      const a = luminance(rgb(getComputedStyle(element).color));
      const b = luminance(background);
      return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    });
  });
  expect(Math.min(...ratios)).toBeGreaterThanOrEqual(4.5);
}
