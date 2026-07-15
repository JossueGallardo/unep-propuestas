import { ImageResponse } from "next/og";

export const alt = "UNEP — Unidos por el cambio Novembrino";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const logoUrl = "https://unep-propuestas.vercel.app/brand/logo.jpeg";

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
          Unión Novembrina Educación y Progreso
        </div>
        <div
          style={{
            fontSize: 150,
            lineHeight: 0.9,
            fontWeight: 900,
            marginTop: 35,
          }}
        >
          UNEP
        </div>
        <div style={{ fontSize: 48, lineHeight: 1.1, marginTop: 38 }}>
          Unidos por el cambio Novembrino
        </div>
      </div>
      {/* ImageResponse renders standalone markup and cannot use next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt="Logo oficial de UNEP"
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
