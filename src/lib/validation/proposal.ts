import { z } from "zod";

import { communityRoles, proposalCategories } from "@/lib/constants";

const categoryValues = proposalCategories.map((category) => category.value) as [
  (typeof proposalCategories)[number]["value"],
  ...(typeof proposalCategories)[number]["value"][],
];

const communityRoleValues = communityRoles.map((role) => role.value) as [
  (typeof communityRoles)[number]["value"],
  ...(typeof communityRoles)[number]["value"][],
];

export const proposalFormSchema = z
  .object({
    isAnonymous: z.boolean(),
    submitterName: z
      .string()
      .max(100, "El nombre no puede superar 100 caracteres."),
    communityRole: z.union([z.enum(communityRoleValues), z.literal("")]),
    courseOrArea: z
      .string()
      .max(80, "El curso o área no puede superar 80 caracteres."),
    category: z.enum(categoryValues, { error: "Selecciona una categoría." }),
    customCategory: z
      .string()
      .max(60, "La categoría personalizada no puede superar 60 caracteres."),
    title: z
      .string()
      .trim()
      .min(5, "Escribe un título de al menos 5 caracteres.")
      .max(140, "El título no puede superar 140 caracteres."),
    description: z
      .string()
      .trim()
      .min(20, "Describe tu propuesta con al menos 20 caracteres.")
      .max(4000, "La descripción no puede superar 4000 caracteres."),
    expectedBenefit: z
      .string()
      .max(1200, "El beneficio esperado no puede superar 1200 caracteres."),
    privacyAccepted: z.boolean().refine((value) => value, {
      message: "Debes aceptar el aviso de privacidad y uso responsable.",
    }),
    website: z.string().max(200).optional().default(""),
    formToken: z.string().min(20, "Actualiza la página e inténtalo de nuevo."),
    turnstileToken: z.string().optional().default(""),
  })
  .superRefine((value, context) => {
    if (value.category === "otra" && value.customCategory.trim().length < 2) {
      context.addIssue({
        code: "custom",
        path: ["customCategory"],
        message: "Escribe una categoría de al menos 2 caracteres.",
      });
    }
  });

export type ProposalFormInput = z.input<typeof proposalFormSchema>;
export type ParsedProposalForm = z.output<typeof proposalFormSchema>;

function normalizeShortText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeLongText(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/[ \t]+/g, " "))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function nullable(value: string) {
  const normalized = normalizeShortText(value);
  return normalized.length ? normalized : null;
}

export function normalizeProposalInput(value: ParsedProposalForm) {
  return {
    isAnonymous: value.isAnonymous,
    submitterName: value.isAnonymous ? null : nullable(value.submitterName),
    communityRole: value.communityRole || null,
    courseOrArea: nullable(value.courseOrArea),
    category: value.category,
    customCategory:
      value.category === "otra" ? nullable(value.customCategory) : null,
    title: normalizeShortText(value.title),
    description: normalizeLongText(value.description),
    expectedBenefit: value.expectedBenefit.trim()
      ? normalizeLongText(value.expectedBenefit)
      : null,
  };
}
