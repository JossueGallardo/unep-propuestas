export const proposalCategories = [
  { value: "academico", label: "Académico" },
  { value: "infraestructura_espacios", label: "Infraestructura y espacios" },
  { value: "convivencia_bienestar", label: "Convivencia y bienestar" },
  { value: "cultura_eventos", label: "Cultura y eventos" },
  { value: "deportes_recreacion", label: "Deportes y recreación" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "medio_ambiente", label: "Medio ambiente" },
  { value: "seguridad", label: "Seguridad" },
  { value: "otra", label: "Otra" },
] as const;

export const communityRoles = [
  { value: "estudiante", label: "Estudiante" },
  { value: "docente", label: "Docente" },
  { value: "familia", label: "Familia" },
  { value: "personal", label: "Personal" },
  { value: "otro", label: "Otro" },
] as const;

export const proposalStatuses = [
  { value: "nueva", label: "Nueva" },
  { value: "revisada", label: "Revisada" },
  { value: "archivada", label: "Archivada" },
] as const;

export type ProposalCategory = (typeof proposalCategories)[number]["value"];
export type CommunityRole = (typeof communityRoles)[number]["value"];
export type ProposalStatus = (typeof proposalStatuses)[number]["value"];

export function getCategoryLabel(value: string) {
  return (
    proposalCategories.find((category) => category.value === value)?.label ??
    value
  );
}

export function getCommunityRoleLabel(value: string | null) {
  if (!value) return "No especificada";
  return communityRoles.find((role) => role.value === value)?.label ?? value;
}

export function getStatusLabel(value: string) {
  return (
    proposalStatuses.find((status) => status.value === value)?.label ?? value
  );
}
