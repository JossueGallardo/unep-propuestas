import { expect, test } from "@playwright/test";

import { grantVercelPreviewAccess } from "./vercel-preview";

test.describe("flujos conectados", () => {
  test.skip(
    process.env.E2E_LIVE !== "true",
    "Requiere preview conectado a Supabase",
  );

  test.beforeEach(async ({ page }) => {
    await grantVercelPreviewAccess(page);
  });

  test("rechaza lectura pública de propuestas", async ({ request }) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const response = await request.get(`${url}/rest/v1/proposals?select=*`, {
      headers: { apikey: key },
    });
    expect([401, 403]).toContain(response.status());
  });

  test("login incorrecto no revela detalles", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Correo electrónico").fill("incorrecto@example.com");
    await page.getByLabel("Contraseña").fill("contraseña-incorrecta");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(
      page.getByText("Las credenciales no son correctas."),
    ).toBeVisible();
  });

  test("administrador consulta, filtra, exporta y cierra sesión", async ({
    page,
  }) => {
    test.skip(
      !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
      "Requiere credenciales administrativas efímeras",
    );
    await page.goto("/admin/login");
    await page
      .getByLabel("Correo electrónico")
      .fill(process.env.E2E_ADMIN_EMAIL!);
    await page.getByLabel("Contraseña").fill(process.env.E2E_ADMIN_PASSWORD!);
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(
      page.getByRole("heading", { name: "Propuestas" }),
    ).toBeVisible();
    await page.getByLabel("Estado").selectOption("nueva");
    await page.getByRole("button", { name: "Aplicar filtros" }).click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: "Exportar CSV" }).click();
    expect((await downloadPromise).suggestedFilename()).toBe(
      "unep-propuestas.csv",
    );
    await page.getByRole("link", { name: "Limpiar" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByLabel("Estado")).toHaveValue("");
    await page.getByRole("button", { name: /Cerrar sesión/ }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
