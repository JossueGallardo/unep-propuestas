import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { grantVercelPreviewAccess } from "./vercel-preview";

const expectedSiteUrl =
  process.env.E2E_EXPECTED_SITE_URL ??
  process.env.E2E_BASE_URL ??
  "http://127.0.0.1:3000";

test.beforeEach(async ({ page }) => {
  await grantVercelPreviewAccess(page);
});

async function mockFormToken(page: Page) {
  await page.route("**/api/proposals/token", (route) =>
    route.fulfill({ json: { token: "token-firmado-de-pruebas-suficiente" } }),
  );
}

test("portada accesible, navegable y sin desbordamiento", async ({ page }) => {
  await mockFormToken(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "UNEP", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Envía tu propuesta." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Enviar propuesta" }),
  ).toBeEnabled();
  await expect(
    page.getByText(
      "Estas categorías solo ayudan a organizar. Si ninguna encaja, puedes escribir la tuya.",
    ),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", {
      name: "Instagram de UNEP (abre en una pestaña nueva)",
    }),
  ).toHaveAttribute("href", "https://www.instagram.com/lista_unep/");
  const footer = page.getByRole("contentinfo");
  await expect(
    footer.getByRole("heading", {
      name: "El cambio comienza escuchando.",
    }),
  ).toBeVisible();
  await expect(
    footer.getByRole("link", { name: "Acceso administrativo" }),
  ).toHaveCount(0);
  await expect(footer.getByText("@lista_unep")).toBeVisible();
  const wordmarkBottomSpace = await footer
    .locator("[data-footer-wordmark]")
    .evaluate((wordmark) => {
      const footerElement = wordmark.closest("footer");
      return footerElement
        ? footerElement.getBoundingClientRect().bottom -
            wordmark.getBoundingClientRect().bottom
        : 0;
    });
  expect(wordmarkBottomSpace).toBeGreaterThanOrEqual(24);

  const consentLayout = await page
    .locator('label[for="privacyAccepted"]')
    .evaluate((label) => {
      const checkbox = document.querySelector<HTMLElement>(
        '[data-slot="checkbox"]',
      );
      const labelRect = label.getBoundingClientRect();
      const checkboxRect = checkbox?.getBoundingClientRect();
      return {
        display: getComputedStyle(label).display,
        labelWidth: labelRect.width,
        correctlyOrdered: checkboxRect
          ? checkboxRect.right <= labelRect.left
          : false,
      };
    });
  expect(consentLayout.display).toBe("block");
  expect(consentLayout.labelWidth).toBeGreaterThan(200);
  expect(consentLayout.correctlyOrdered).toBe(true);

  const compactControls = await page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLElement>(
        '#envia-tu-propuesta [data-slot="input"], #envia-tu-propuesta [data-slot="select-trigger"], #envia-tu-propuesta button[type="submit"]',
      ),
    ]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return (
          rect.width > 0 && rect.height > 0 && !element.matches(":disabled")
        );
      })
      .filter((element) => element.getBoundingClientRect().height < 44)
      .map((element) => element.getAttribute("data-slot") ?? element.tagName),
  );
  expect(compactControls).toEqual([]);
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .filter(
        (animation) => animation.effect?.getTiming().iterations !== Infinity,
      )
      .every((animation) => animation.playState === "finished"),
  );
  const violations = await new AxeBuilder({ page }).analyze();
  expect(violations.violations).toEqual([]);
  const hasOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);

  await page
    .locator(
      'a[href="#como-funciona"]:visible, a[href="/#como-funciona"]:visible',
    )
    .last()
    .click();
  await expect(page).toHaveURL(/#como-funciona$/);
  await expect
    .poll(() =>
      page.locator("#como-funciona").evaluate((section) => {
        const header = document.querySelector("header");
        return (
          section.getBoundingClientRect().top >=
          (header?.getBoundingClientRect().bottom ?? 0) - 1
        );
      }),
    )
    .toBe(true);
});

test("navegación por teclado conserva foco visible", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === "webkit",
    "WebKit emula el tabulado predeterminado de Safari, que omite enlaces.",
  );
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Saltar al contenido" }),
  ).toBeFocused();
});

test("privacidad y acceso administrativo conservan metadata y accesibilidad", async ({
  page,
}) => {
  test.setTimeout(60_000);

  for (const path of ["/privacidad", "/admin/login"]) {
    await page.goto(path);
    const violations = await new AxeBuilder({ page }).analyze();
    expect(violations.violations).toEqual([]);
    const hasOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  }

  await page.goto("/privacidad");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Aviso de privacidad | UNEP",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    `${expectedSiteUrl}/privacidad`,
  );

  await page.goto("/admin/login");
  await expect(page.locator('meta[property^="og:"]')).toHaveCount(0);
});

test("valida campos y muestra categoría personalizada", async ({ page }) => {
  await mockFormToken(page);
  await page.goto("/#envia-tu-propuesta");
  await page.getByRole("button", { name: "Enviar propuesta" }).click();
  await expect(
    page.getByText("Escribe un título de al menos 5 caracteres."),
  ).toBeVisible();
  await page.getByLabel("Categoría").click();
  await page.getByRole("option", { name: "Otra" }).click();
  await expect(
    page.getByLabel("¿Qué categoría describe mejor tu propuesta?"),
  ).toBeVisible();
});

test("envía propuestas anónimas y con nombre mostrando solo la referencia", async ({
  page,
}) => {
  let capturedBody: Record<string, unknown> | undefined;
  await page.route("**/api/proposals/token", (route) =>
    route.fulfill({ json: { token: "token-firmado-de-pruebas-suficiente" } }),
  );
  await page.route("**/api/proposals", async (route) => {
    capturedBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ referenceCode: "UNEP-ABCDEF123456" }),
    });
  });
  await page.goto("/#envia-tu-propuesta");
  await page.getByLabel("Título de la propuesta").fill("Mejorar la biblioteca");
  await page
    .getByLabel("Descripción detallada")
    .fill("Propongo ampliar el horario y añadir nuevos espacios de lectura.");
  await page.getByLabel(/He leído/).click();
  await expect(page.getByLabel(/He leído/)).toBeChecked();
  await page.getByRole("button", { name: "Enviar propuesta" }).click();
  await expect(page.getByText("UNEP-ABCDEF123456")).toBeVisible();
  expect(capturedBody?.isAnonymous).toBe(true);
  expect(capturedBody?.website).toBe("");

  await page.getByRole("button", { name: "Enviar otra propuesta" }).click();
  await page.getByLabel("Enviar de forma anónima").click();
  await page.getByLabel(/Nombre/).fill("Ana Pérez");
  await page
    .getByLabel("Título de la propuesta")
    .fill("Más actividades culturales");
  await page
    .getByLabel("Descripción detallada")
    .fill(
      "Propongo encuentros culturales mensuales para toda la comunidad educativa.",
    );
  await page.getByLabel(/He leído/).click();
  await expect(page.getByLabel(/He leído/)).toBeChecked();
  await page.getByRole("button", { name: "Enviar propuesta" }).click();
  await expect(page.getByText("UNEP-ABCDEF123456")).toBeVisible();
  expect(capturedBody?.isAnonymous).toBe(false);
  expect(capturedBody?.submitterName).toBe("Ana Pérez");
});

test("respeta movimiento reducido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const duration = await page
    .locator(".animate-enter")
    .first()
    .evaluate((element) => getComputedStyle(element).animationDuration);
  expect(["0s", "0.01ms", "1e-05s", "0.00001s"]).toContain(duration);
});

test("webkit smoke: portada responsive, accesible e interactiva", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    const text = message.text();
    const isProtectedPreviewToolbar =
      Boolean(process.env.E2E_VERCEL_SHARE_TOKEN) &&
      text.includes("vercel.live/_next-live/feedback/feedback.js") &&
      text.includes("Content Security Policy");

    if (message.type() === "error" && !isProtectedPreviewToolbar) {
      consoleErrors.push(text);
    }
  });
  await mockFormToken(page);
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "UNEP", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Enviar propuesta" }),
  ).toBeEnabled();

  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(page.getByRole("button", { name: "Cerrar menú" })).toBeVisible();
  await page.getByRole("button", { name: "Cerrar menú" }).click();

  await page.getByLabel(/He leído/).click();
  await expect(page.getByLabel(/He leído/)).toBeChecked();

  const violations = await new AxeBuilder({ page }).analyze();
  expect(violations.violations).toEqual([]);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
  expect(consoleErrors).toEqual([]);
});
