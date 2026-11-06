import { test as base, expect } from "@playwright/test";

const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};

export const test = base.extend({
  telegramClient: [{}, { option: true }],
  board: async ({ page, context, telegramClient }, use) => {
    let rows = [{
      id: 1,
      task_name: "Persistence original",
      importance: 1,
      finished_at: null,
      user_tele_id: 101010101,
      created_at: "2026-11-06T08:00:00Z",
    }];
    let nextId = 2;
    let gate;
    const writes = [];
    const errors = [];
    const routeErrors = [];
    page.on("pageerror", error => errors.push(error.message));
    await context.addInitScript(client => {
      const handlers = {};
      window.__telegramViewportCalls = { expand: 0, fullscreen: 0 };
      const webApp = {
        initDataUnsafe: { user: { id: 101010101 } },
        platform: client.platform,
        viewportStableHeight: client.height,
        safeAreaInset: client.safeAreaInset,
        contentSafeAreaInset: client.contentSafeAreaInset,
        isVersionAtLeast: version => Number(client.version || 0) >= Number(version),
        ready() {},
        expand() { window.__telegramViewportCalls.expand++; },
        onEvent(event, handler) { (handlers[event] ||= new Set()).add(handler); },
        offEvent(event, handler) { handlers[event]?.delete(handler); },
        emit(event) { handlers[event]?.forEach(handler => handler()); },
      };
      if (client.fullscreenAvailable) {
        webApp.requestFullscreen = () => {
          window.__telegramViewportCalls.fullscreen++;
          if (client.fullscreenThrows) throw new Error("Unsupported fullscreen");
        };
      }
      window.Telegram = {};
      // The bundled SDK assigns this global during import; retain the controlled host.
      Object.defineProperty(window.Telegram, "WebApp", {
        get: () => webApp,
        set: () => {},
        configurable: true,
      });
    }, telegramClient);
    // Never allow the test browser to contact a real external service.
    await context.route("**/*", async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === "http://127.0.0.1:4174") return route.continue();
      if (url.hostname !== "persistence-test.supabase.co") return route.abort();
      const json = (body, status = 200) => route.fulfill({
        status, contentType: "application/json", body: JSON.stringify(body),
      });
      try {
        if (url.pathname.includes("/auth/")) return json({ message: "Isolated authentication" }, 400);
        if (url.pathname.endsWith("/Quotes")) return json([]);
        expect(url.pathname).toBe("/rest/v1/Todo");
        if (request.method() === "GET") {
          expect(url.searchParams.get("user_tele_id")).toBe("eq.101010101");
          return json(rows);
        }
        const pending = gate;
        expect(pending, "Unexpected or duplicated database write").toBeTruthy();
        gate = null;
        const body = request.postDataJSON();
        const id = Number((url.searchParams.get("id") || "").replace("eq.", ""));
        writes.push({ method: request.method(), id, body });
        pending.arrived.resolve();
        await pending.release.promise;
        if (pending.fail) return json({ message: "Rejected test write", code: "42501" }, 403);
        let result;
        if (request.method() === "POST") {
          result = body.map(item => {
            expect(item.user_tele_id).toBe(101010101);
            const row = { ...item, id: nextId++, created_at: new Date().toISOString() };
            rows.push(row);
            return row;
          });
        } else {
          expect(url.searchParams.get("user_tele_id")).toBe("eq.101010101");
          const row = rows.find(item => item.id === id);
          expect(row, "Mutation must target an existing fixture task").toBeTruthy();
          if (request.method() === "PATCH") Object.assign(row, body);
          else {
            expect(request.method()).toBe("DELETE");
            rows = rows.filter(item => item.id !== id);
          }
          result = request.headers().accept?.includes("application/vnd.pgrst.object+json") ? row : [row];
        }
        return json(result);
      } catch (error) {
        routeErrors.push(error.message);
        return json({ message: error.message }, 500);
      }
    });

    const tasks = () => page.getByRole("button", { name: "Tasks", exact: true }).click();
    const focus = () => page.getByRole("button", { name: "Focus", exact: true }).click();
    const card = id => page.locator(`#tasks-panel [data-task-id="${id}"]`);
    const manage = (id = 1) => card(id).getByRole("button", { name: /^Move or manage / });
    const add = page.locator(".task-input-container button[type='submit']");
    const roundTrip = async () => {
      const count = writes.length;
      await focus();
      await tasks();
      expect(writes).toHaveLength(count);
    };
    const reload = async () => {
      await page.reload();
      await tasks();
      await expect(page.locator(".board-feedback")).not.toContainText("Loading tasks...");
      await expect(add).toBeEnabled();
    };
    const mutation = async (action, verify, { fail = false, errorText } = {}) => {
      const pending = { arrived: deferred(), release: deferred(), fail };
      gate = pending;
      const count = writes.length;
      try {
        await test.step("Switch screens while the database response is pending", async () => {
          await action();
          await pending.arrived.promise;
          await expect(add).toBeDisabled();
          await roundTrip();
          await expect(add).toBeDisabled();
          await focus();
          pending.release.resolve();
          await expect(add).toBeEnabled();
          await tasks();
          expect(writes).toHaveLength(count + 1);
          if (errorText) await expect(page.locator(".board-feedback [role='alert']")).toContainText(errorText);
          await verify();
        });
        await test.step("Saved state survives navigation", async () => {
          await roundTrip();
          await verify();
        });
        await test.step("A fresh load reads the same database state", async () => {
          await reload();
          await verify();
        });
      } finally {
        pending.release.resolve();
      }
    };
    const seedTasks = async tasks => {
      rows = tasks.map(task => ({ ...task }));
      nextId = Math.max(0, ...rows.map(task => task.id)) + 1;
      await reload();
    };

    await page.goto("/");
    await tasks();
    await expect(card(1)).toBeVisible();
    await use({ tasks, focus, card, manage, roundTrip, reload, seedTasks, mutation, rows: () => rows, writes });
    expect(routeErrors, "Mock database contract violations").toEqual([]);
    expect(errors, "Uncaught browser errors").toEqual([]);
  },
});

export { expect };
