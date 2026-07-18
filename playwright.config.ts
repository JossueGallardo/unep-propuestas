import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        env: {
          NEXT_PUBLIC_SUPABASE_URL:
            process.env.NEXT_PUBLIC_SUPABASE_URL ??
            "https://example.supabase.co",
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
            "sb_publishable_ci",
          NEXT_PUBLIC_SITE_URL: baseURL,
          RATE_LIMIT_HMAC_SECRET:
            process.env.RATE_LIMIT_HMAC_SECRET ??
            "ci-rate-limit-secret-with-enough-entropy",
          PROPOSAL_RPC_SECRET:
            process.env.PROPOSAL_RPC_SECRET ??
            "ci-rpc-secret-with-enough-entropy",
        },
      },
  projects: [
    {
      name: "desktop-1440",
      grepInvert: /webkit smoke/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "laptop-1280",
      grepInvert: /webkit smoke/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "mobile-390",
      grepInvert: /webkit smoke/,
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: "mobile-412",
      grepInvert: /webkit smoke/,
      use: { ...devices["Galaxy S9+"], viewport: { width: 412, height: 915 } },
    },
    {
      name: "mobile-webkit-390",
      grep: /webkit smoke/,
      use: {
        ...devices["iPhone 13"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
});
