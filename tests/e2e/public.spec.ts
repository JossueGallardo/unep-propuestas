import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("portada accesible, navegable y sin desbordamiento", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "UNEP", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Envía tu propuesta." }),
  ).toBeVisible();
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
});

test("navegación por teclado conserva foco visible", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Saltar al contenido" }),
  ).toBeFocused();
});

test("valida campos y muestra categoría personalizada", async ({ page }) => {
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
  await page.getByLabel(/He leído/).check();
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
  await page.getByLabel(/He leído/).check();
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
  expect(["0.01ms", "1e-05s"]).toContain(duration);
});
