import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UNEP Propuestas",
    short_name: "UNEP",
    description: "Propuestas de la comunidad novembrina.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF9F5",
    theme_color: "#C00808",
    lang: "es",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
