import { test, expect, trackTimerClickSound } from "./fixtures.js";

test.beforeEach(async ({ context }) => {
  await trackTimerClickSound(context);
  await context.addInitScript(() => {
    const NativeAudio = window.Audio;
    window.__alarmPlayers = [];
    window.Audio = function (path) {
      const audio = new NativeAudio(path);
      if (new URL(path, location.href).pathname.endsWith("/alarm.wav")) {
        const events = [];
        const play = audio.play.bind(audio);
        audio.play = () => {
          events.push("play-request");
          return play();
        };
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

  // Probe the native clip independently of the timer UI's matching dismissal.
  await page.evaluate(async () => {
    const { default: manager } = await import("/src/utils/audioManager.ts");
    manager.play("alarm");
  });
  await page.waitForFunction(() => !window.__alarmPlayers[0].audio.paused);
  const initial = await page.evaluate(() => ({
    count: window.__alarmPlayers.length,
    duration: window.__alarmPlayers[0].audio.duration,
    loop: window.__alarmPlayers[0].audio.loop,
  }));
  expect(initial.count).toBe(1);
  expect(initial.duration).toBeCloseTo(3, 2);
  expect(initial.loop).toBe(false);

  // The sound must end even when JavaScript cannot run a stop callback.
  await page.evaluate(() => {
    const until = performance.now() + 4000;
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

const setAppActive = (page, active, host) => page.evaluate(({ active, host }) => {
  if (host === "telegram") {
    window.Telegram.WebApp.isActive = active;
    window.Telegram.WebApp.emit(active ? "activated" : "deactivated");
  } else {
    Object.defineProperty(document, "visibilityState", { configurable: true, value: active ? "visible" : "hidden" });
    Object.defineProperty(document, "hidden", { configurable: true, value: !active });
    document.dispatchEvent(new Event("visibilitychange"));
  }
}, { active, host });

const startCustomTimer = async (page, seconds) => {
  await page.getByRole("button", { name: "Custom timer", exact: true }).click();
  await page.getByLabel("Minutes", { exact: true }).selectOption("0");
  await page.getByLabel("Seconds", { exact: true }).selectOption(String(seconds));
  await page.getByRole("button", { name: "Start", exact: true }).click();
};

test("returning after a background deadline completes the timer without a late alarm", async ({ page, board }) => {
  await board.focus();
  await page.clock.install();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  for (const host of ["browser", "telegram"]) {
    for (const elapsed of [31000, 60000, null]) {
      await startCustomTimer(page, 30);
      await setAppActive(page, false, host);
      // Cover both suspended callbacks and a countdown still ticking while hidden.
      if (elapsed !== null) await page.clock.setSystemTime(await page.evaluate(ms => Date.now() + ms, elapsed));
      else await page.clock.runFor(30000);
      await setAppActive(page, true, host);
      await page.clock.runFor(1000);
      expect(await page.evaluate(() => window.__alarmPlayers[0].events)).not.toContain("play-request");
      await expect(page.getByRole("timer")).toHaveText("25:00");
      await expect(page.getByRole("button", { name: "Start", exact: true })).toBeEnabled();
    }
  }
  // Returning before the deadline must still allow the normal foreground alarm.
  await startCustomTimer(page, 30);
  await setAppActive(page, false, "browser");
  await page.clock.setSystemTime(await page.evaluate(() => Date.now() + 10000));
  await setAppActive(page, true, "browser");
  await page.clock.runFor(20000);
  expect(await page.evaluate(() => window.__alarmPlayers[0].events.filter(event => event === "play-request"))).toHaveLength(1);
  await page.clock.runFor(3000);
  await expect(page.getByRole("timer")).toHaveText("25:00");

  await page.getByRole("button", { name: "Start", exact: true }).click();
  await setAppActive(page, false, "browser");
  await page.clock.setSystemTime(await page.evaluate(() => Date.now() + 26 * 60 * 1000));
  await setAppActive(page, true, "browser");
  await page.clock.runFor(1000);
  await expect(page.locator(".session-dots .filled")).toHaveCount(1);
  await expect(page.getByRole("timer")).toHaveText("05:00");
  await setAppActive(page, true, "browser");
  await page.clock.runFor(5000);
  await expect(page.locator(".session-dots .filled")).toHaveCount(1);
  expect(await page.evaluate(() => window.__alarmPlayers[0].events.filter(event => event === "play-request"))).toHaveLength(1);
});

test("leaving during an alarm stops playback and returning does not replay it", async ({ page, board }) => {
  await board.focus();
  for (const host of ["browser", "telegram"]) {
    await startCustomTimer(page, 1);
    await page.waitForFunction(() => !window.__alarmPlayers[0].audio.paused);
    const plays = await page.evaluate(() => window.__alarmPlayers[0].events.filter(event => event === "play-request").length);
    await setAppActive(page, false, host);
    expect(await page.evaluate(() => window.__alarmPlayers[0].audio.paused)).toBe(true);
    await setAppActive(page, true, host);
    await expect(page.getByRole("button", { name: "Start", exact: true })).toBeEnabled();
    expect(await page.evaluate(() => window.__alarmPlayers[0].events.filter(event => event === "play-request").length)).toBe(plays);
  }
});

test("starting and resuming play the click once; pause, reset, and invalid timers stay silent", async ({ page, board }) => {
  await board.focus();
  const sound = () => page.evaluate(() => window.__timerClickSound);
  for (const mode of ["Work", "Short Break", "Long Break"]) {
    await page.getByRole("button", { name: mode, exact: true }).click();
    const before = (await sound()).plays;
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await expect.poll(sound).toEqual({ plays: before + 1, ends: before + 1, loop: false });
    await expect(page.getByRole("timer")).not.toHaveText(mode === "Work" ? "25:00" : mode === "Short Break" ? "05:00" : "15:00");
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    expect((await sound()).plays).toBe(before + 1);
    await page.getByRole("button", { name: "Resume", exact: true }).click();
    await expect.poll(sound).toEqual({ plays: before + 2, ends: before + 2, loop: false });
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    expect((await sound()).plays).toBe(before + 2);
  }

  await page.getByRole("button", { name: "Custom timer", exact: true }).click();
  await page.getByLabel("Minutes", { exact: true }).selectOption("0");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("valid time");
  expect((await sound()).plays).toBe(6);
  await page.getByLabel("Seconds", { exact: true }).selectOption("30");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect.poll(sound).toEqual({ plays: 7, ends: 7, loop: false });
});
