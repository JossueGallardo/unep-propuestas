import { ImageResponse } from "next/og";

export const alt = "UNEP — Unidos por el cambio Novembrino";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
      <div
        style={{
          width: 250,
          height: 250,
          border: "14px solid white",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 70,
          fontWeight: 900,
        }}
      >
        U
      </div>
    </div>,
    size,
  );
}
