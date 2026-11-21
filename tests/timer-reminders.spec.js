import { test, expect, trackTimerClickSound } from "./fixtures.js";

test.use({ telegramClient: { initData: "isolated-signed-identity" } });
const mocks = new WeakMap();

test.beforeEach(async ({ page, context }) => {
  await trackTimerClickSound(context);
  await context.addInitScript(() => {
    window.__alarmRequests = 0;
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (new URL(this.src, location.href).pathname.endsWith("/alarm.wav")) window.__alarmRequests++;
      return play.call(this);
    };
  });
  const api = {
    timer: { version: 0, state: "idle", mode: "work", durationSeconds: 1500, remainingSeconds: 1500 },
    calls: [],
    failNext: false,
    committedFailure: false,
  };
  mocks.set(page, api);
  await page.route("**/api/timer", async route => {
    const request = route.request();
    expect(request.headers()["x-telegram-init-data"]).toBe("isolated-signed-identity");
    const body = request.postDataJSON();
    api.calls.push(body);
    const json = (value, status = 200) => route.fulfill({
      status, contentType: "application/json", body: JSON.stringify(value),
    });
    if (body.action !== "read") {
      expect(body.requestId).toMatch(/^[\da-f-]{36}$/);
      expect(body.version).toBe(api.timer.version);
      if (api.failNext && !api.committedFailure) {
        api.failNext = false;
        return json({}, 503);
      }
      api.timer.version++;
      if (body.action === "start") Object.assign(api.timer, {
        state: "running", mode: body.mode,
        durationSeconds: body.durationSeconds, remainingSeconds: body.durationSeconds,
      });
      if (body.action === "pause") api.timer.state = "paused";
      if (body.action === "resume") api.timer.state = "running";
      if (body.action === "reset") Object.assign(api.timer, {
        state: "idle", remainingSeconds: api.timer.durationSeconds,
      });
      if (api.failNext) {
        api.failNext = false;
        return json({}, 503);
      }
    }
    return json(api.timer);
  });
});

test("reminders synchronize start, pause, reload, resume, reset, and server completion", async ({ page, board }) => {
  const api = mocks.get(page);
  await board.focus();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeEnabled();
  await expect.poll(() => page.evaluate(() => window.__timerClickSound.plays)).toBe(1);
  api.timer.remainingSeconds = 1490;
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.getByRole("timer")).toHaveText("24:50");
  expect(await page.evaluate(() => window.__timerClickSound.plays)).toBe(1);
  await board.roundTrip();
  await board.reload();
  await board.focus();
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeEnabled();
  await expect(page.getByRole("timer")).toHaveText("24:50");
  expect(await page.evaluate(() => window.__timerClickSound.plays)).toBe(0);
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeEnabled();
  await expect.poll(() => page.evaluate(() => window.__timerClickSound.plays)).toBe(1);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByRole("timer")).toHaveText("25:00");
  expect(await page.evaluate(() => window.__timerClickSound.plays)).toBe(1);
  expect(api.timer.state).toBe("idle");
  await page.getByRole("button", { name: "Short Break", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeEnabled();
  expect(api.timer.mode).toBe("shortBreak");

  // Server-owned completion persists even with no mounted Mini App.
  await page.goto("about:blank");
  Object.assign(api.timer, { state: "completed", remainingSeconds: 0, version: api.timer.version + 1 });
  await page.goto("/");
  await board.focus();
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeEnabled();
  expect(api.calls.filter(call => call.action === "start")).toHaveLength(3);
  expect(api.calls.filter(call => call.action === "pause")).toHaveLength(1);
  expect(api.calls.filter(call => call.action === "resume")).toHaveLength(1);
  expect(board.writes).toHaveLength(0);

  // The deadline can expire before the bot worker changes running to completed.
  Object.assign(api.timer, { state: "running", remainingSeconds: 0 });
  await board.reload();
  await board.focus();
  expect(await page.evaluate(() => window.__alarmRequests)).toBe(0);
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeEnabled();
});

test("failed saves stay stopped and ambiguous committed saves reconcile without resending", async ({ page, board }) => {
  const api = mocks.get(page);
  await board.focus();
  api.failNext = true;
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Couldn't sync");
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeEnabled();
  expect(api.timer.state).toBe("idle");
  expect(await page.evaluate(() => window.__timerClickSound.plays)).toBe(0);
  api.failNext = true;
  api.committedFailure = true;
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeEnabled();
  expect(api.timer.state).toBe("running");
  expect(api.calls.filter(call => call.action === "start")).toHaveLength(2);
  expect(await page.evaluate(() => window.__timerClickSound.plays)).toBe(0);
});
