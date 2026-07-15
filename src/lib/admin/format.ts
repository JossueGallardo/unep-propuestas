const dateFormatter = new Intl.DateTimeFormat("es-EC", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Guayaquil",
});

export function formatAdminDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "—";
}
