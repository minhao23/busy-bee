import { test, expect } from "./fixtures.js";

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    const NativeAudio = window.Audio;
    window.__alarmPlayers = [];
    window.Audio = function (path) {
      const audio = new NativeAudio(path);
      if (new URL(path, location.href).pathname.endsWith("/alarm.wav")) {
        const events = [];
        for (const type of ["playing", "ended", "pause"]) {
          audio.addEventListener(type, () => events.push(type));
        }
        window.__alarmPlayers.push({ audio, events });
      }
      return audio;
    };
  });
});

test("alarm ends naturally and repeated initialization cannot orphan playback", async ({ page, board }) => {
  await board.focus();
  const startShortTimer = async () => {
    await page.getByRole("button", { name: "Custom timer", exact: true }).click();
    await page.getByLabel("Minutes", { exact: true }).selectOption("0");
    await page.getByLabel("Seconds", { exact: true }).selectOption("1");
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await page.waitForFunction(() => !window.__alarmPlayers[0].audio.paused);
  };

  await startShortTimer();
  const initial = await page.evaluate(() => ({
    count: window.__alarmPlayers.length,
    duration: window.__alarmPlayers[0].audio.duration,
    loop: window.__alarmPlayers[0].audio.loop,
  }));
  expect(initial.count).toBe(1);
  expect(initial.duration).toBeCloseTo(2, 2);
  expect(initial.loop).toBe(false);

  // Stall JavaScript past the clip's end but before the four-second UI dismissal.
  await page.evaluate(() => {
    const until = performance.now() + 3000;
    while (performance.now() < until) {}
  });
  await page.waitForFunction(() => {
    const { audio, events } = window.__alarmPlayers[0];
    return audio.paused && events.includes("ended");
  });
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeEnabled();

  await startShortTimer();
  const afterInit = await page.evaluate(async () => {
    const { default: manager } = await import("/src/utils/audioManager.ts");
    const original = window.__alarmPlayers[0].audio;
    manager.init();
    manager.init();
    return { count: window.__alarmPlayers.length, originalStillPlaying: !original.paused };
  });
  expect(afterInit).toEqual({ count: 1, originalStillPlaying: true });
  await page.getByRole("button", { name: "Dismiss", exact: true }).click();
  const dismissed = await page.evaluate(() => {
    const audio = window.__alarmPlayers[0].audio;
    return { paused: audio.paused, position: audio.currentTime, loop: audio.loop };
  });
  expect(dismissed).toEqual({ paused: true, position: 0, loop: false });
});
