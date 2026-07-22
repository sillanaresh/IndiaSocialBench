import { ImageResponse } from "next/og";
import { getLeaderboard } from "@/lib/data";

export const alt = "IndiaSocialBench. Does your model understand India?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  const modelCount = getLeaderboard().models.length;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5efe5",
          color: "#211d18",
          padding: "72px 82px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 700 }}>
          <span style={{ color: "#b55b2a" }}>India</span>SocialBench
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          <div style={{ fontSize: 76, lineHeight: 1.08, letterSpacing: "-2px", fontWeight: 700 }}>
            Does your model understand India?
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 34,
              fontFamily: "Arial, sans-serif",
              fontSize: 27,
              lineHeight: 1.4,
              color: "#655b50",
            }}
          >
            {modelCount} models tested on emotional and cultural intelligence in English, Hinglish, and Hindi.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Arial, sans-serif",
            fontSize: 22,
            color: "#776c60",
          }}
        >
          Every score links to its transcript and judge explanation.
        </div>
      </div>
    ),
    size,
  );
}
