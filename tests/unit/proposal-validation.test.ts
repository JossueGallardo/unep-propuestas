import { describe, expect, it } from "vitest";

import {
  normalizeProposalInput,
  proposalFormSchema,
} from "@/lib/validation/proposal";

const validInput = {
  isAnonymous: false,
  submitterName: "  Ana   Pérez  ",
  communityRole: "estudiante" as const,
  courseOrArea: "  Tercero   A ",
  category: "academico" as const,
  customCategory: "",
  title: "  Mejorar   la biblioteca ",
  description:
    "  Necesitamos más libros.  \r\n\r\n\r\n  Esto beneficiará al alumnado.  ",
  expectedBenefit: "  Más   oportunidades de lectura. ",
  privacyAccepted: true,
  website: "",
  formToken: "token-con-longitud-suficiente",
  turnstileToken: "",
};

describe("proposalFormSchema", () => {
  it("acepta el conjunto válido", () => {
    expect(proposalFormSchema.safeParse(validInput).success).toBe(true);
  });

  it("exige categoría personalizada cuando se selecciona otra", () => {
    const result = proposalFormSchema.safeParse({
      ...validInput,
      category: "otra",
      customCategory: " ",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.flatten().fieldErrors.customCategory).toBeDefined();
  });

  it("aplica todos los límites importantes", () => {
    expect(
      proposalFormSchema.safeParse({ ...validInput, title: "abcd" }).success,
    ).toBe(false);
    expect(
      proposalFormSchema.safeParse({ ...validInput, description: "corta" })
        .success,
    ).toBe(false);
    expect(
      proposalFormSchema.safeParse({
        ...validInput,
        expectedBenefit: "x".repeat(1201),
      }).success,
    ).toBe(false);
    expect(
      proposalFormSchema.safeParse({ ...validInput, privacyAccepted: false })
        .success,
    ).toBe(false);
  });
});

describe("normalizeProposalInput", () => {
  it("normaliza espacios y saltos de línea", () => {
    const parsed = proposalFormSchema.parse(validInput);
    expect(normalizeProposalInput(parsed)).toMatchObject({
      submitterName: "Ana Pérez",
      courseOrArea: "Tercero A",
      title: "Mejorar la biblioteca",
      description: "Necesitamos más libros.\n\nEsto beneficiará al alumnado.",
      expectedBenefit: "Más oportunidades de lectura.",
    });
  });

  it("elimina el nombre cuando el envío es anónimo", () => {
    const parsed = proposalFormSchema.parse({
      ...validInput,
      isAnonymous: true,
    });
    expect(normalizeProposalInput(parsed).submitterName).toBeNull();
  });
});
