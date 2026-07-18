export const siteConfig = {
  shortName: "UNEP",
  name: "Unión Novembrina Educación y Progreso",
  slogan: "Unidos por el cambio Novembrino",
  description:
    "Un espacio privado para que la comunidad novembrina comparta propuestas que contribuyan a mejorar nuestra institución.",
  presentation:
    "En UNEP creemos que el cambio comienza escuchando a nuestra comunidad. Este espacio fue creado para que estudiantes, docentes, familias y demás miembros de la comunidad novembrina compartan propuestas que contribuyan a mejorar nuestra institución.",
  email: "",
  phone: "",
  address: "",
  socialLinks: [
    {
      label: "Instagram",
      handle: "@lista_unep",
      href: "https://www.instagram.com/lista_unep/",
    },
  ],
  locale: "es_EC",
  timezone: "America/Guayaquil",
} as const;

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return configured ? configured.replace(/\/$/, "") : "http://localhost:3000";
}
