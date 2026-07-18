import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.shortName} — ${siteConfig.slogan}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoData = await readFile(
    join(process.cwd(), "public", "brand", "logo.jpeg"),
    "base64",
  );
  const logoUrl = `data:image/jpeg;base64,${logoData}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#C00808",
        color: "white",
        padding: "80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
        <div
          style={{
            fontSize: 28,
            letterSpacing: 7,
            textTransform: "uppercase",
            opacity: 0.78,
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            fontSize: 150,
            lineHeight: 0.9,
            fontWeight: 900,
            marginTop: 35,
          }}
        >
          {siteConfig.shortName}
        </div>
        <div style={{ fontSize: 48, lineHeight: 1.1, marginTop: 38 }}>
          {siteConfig.slogan}
        </div>
      </div>
      {/* ImageResponse renders standalone markup and cannot use next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={`Logo oficial de ${siteConfig.shortName}`}
        width="330"
        height="330"
        style={{
          width: 330,
          height: 330,
          border: "8px solid rgba(255, 255, 255, 0.92)",
          borderRadius: 28,
          objectFit: "contain",
          boxShadow: "0 24px 55px rgba(118, 6, 6, 0.38)",
        }}
      />
    </div>,
    size,
  );
}
