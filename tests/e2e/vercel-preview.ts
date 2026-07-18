import type { Page } from "@playwright/test";

export async function grantVercelPreviewAccess(page: Page) {
  const shareToken = process.env.E2E_VERCEL_SHARE_TOKEN;
  const baseUrl = process.env.E2E_BASE_URL;

  if (!shareToken || !baseUrl) {
    return;
  }

  const accessUrl = new URL(baseUrl);
  accessUrl.searchParams.set("_vercel_share", shareToken);

  await page.goto(accessUrl.toString(), { waitUntil: "domcontentloaded" });
  await page.waitForURL(
    (url) =>
      url.origin === accessUrl.origin && !url.searchParams.has("_vercel_share"),
  );
}
