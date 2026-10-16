import { ImageResponse } from "next/og";
import { SITE } from "@/config/site";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          backgroundColor: "#172121",
          position: "relative",
        }}
      >
        {/* blush band */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200px",
            height: "14px",
            backgroundColor: "#D5573B",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "64px",
            right: "-120px",
            width: "480px",
            height: "480px",
            borderRadius: "9999px",
            backgroundColor: "#D5573B",
            opacity: 0.22,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "180px",
            width: "280px",
            height: "280px",
            borderRadius: "9999px",
            backgroundColor: "#F2CCC3",
            opacity: 0.16,
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 8,
            color: "#7E9181",
            fontFamily: "Verdana, sans-serif",
          }}
        >
          DHAKA · HERITAGE · CRAFT
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 120,
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: "#FBF6F3",
            lineHeight: 1,
            marginTop: 16,
          }}
        >
          {SITE.name}
          <span style={{ color: "#D5573B" }}>.</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "#F2CCC3",
            fontFamily: "Verdana, sans-serif",
            marginTop: 20,
          }}
        >
          {SITE.tagline}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 40,
          }}
        >
          <div
            style={{
              width: 96,
              height: 3,
              backgroundColor: "#D5573B",
              display: "flex",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 4,
              color: "#7E9181",
              fontFamily: "Verdana, sans-serif",
            }}
          >
            MEN · WOMEN · KIDS — MADE IN BANGLADESH
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
