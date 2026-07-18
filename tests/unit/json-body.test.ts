import { describe, expect, it } from "vitest";

import { readJsonBody } from "@/lib/security/json-body";

describe("lectura limitada de JSON", () => {
  it("acepta JSON válido dentro del límite", async () => {
    const request = new Request("https://example.test/api", {
      method: "POST",
      body: JSON.stringify({ title: "Una propuesta" }),
    });

    await expect(readJsonBody(request, 1_000)).resolves.toEqual({
      ok: true,
      value: { title: "Una propuesta" },
    });
  });

  it("rechaza el tamaño real aunque no exista Content-Length", async () => {
    const request = new Request("https://example.test/api", {
      method: "POST",
      body: JSON.stringify({ value: "á".repeat(40) }),
    });

    await expect(readJsonBody(request, 40)).resolves.toEqual({
      ok: false,
      reason: "too_large",
    });
  });

  it("rechaza cuerpos que no son JSON", async () => {
    const request = new Request("https://example.test/api", {
      method: "POST",
      body: "no-es-json",
    });

    await expect(readJsonBody(request, 1_000)).resolves.toEqual({
      ok: false,
      reason: "invalid",
    });
  });
});
