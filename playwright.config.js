import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4174",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } }
      : {}),
  },
  projects: [
    { name: "mobile", testMatch: "**/persistence.spec.js", use: { viewport: { width: 390, height: 900 } } },
    { name: "desktop", testMatch: "**/persistence.spec.js", use: { viewport: { width: 1440, height: 900 } } },
    { name: "ui", testIgnore: "**/persistence.spec.js", use: { viewport: { width: 390, height: 900 } } },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4174 --strictPort",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: false,
    env: {
      VITE_SUPABASE_URL: "https://persistence-test.supabase.co",
      VITE_SUPABASE_ANON_KEY: "isolated-test-key",
    },
  },
});
