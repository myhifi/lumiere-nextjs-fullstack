import { ImageResponse } from "next/og";

// ═══════════════════════════════════════════════════
// 🖼️ OG Image — تُولَّد تلقائياً لكل صفحة
// ═══════════════════════════════════════════════════
// • Next.js يحوّل هذا الملف إلى صورة PNG
// • يُضيف <meta property="og:image"> تلقائياً
// • لا يحتاج تعديل layout.tsx

// الأبعاد القياسية لبطاقات وسائل التواصل
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Lumière — Fine Dining Restaurant";

// يُولَّد مرة واحدة عند البناء (سريع، مُخزَّن)
export const dynamic = "force-static";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf7f2",
          position: "relative",
        }}
      >
        {/* ─── زخرفة الزاوية العلوية اليسرى ─── */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 60,
            width: 100,
            height: 100,
            borderTop: "4px solid #c9a961",
            borderLeft: "4px solid #c9a961",
          }}
        />

        {/* ─── زخرفة الزاوية السفلية اليمنى ─── */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 60,
            width: 100,
            height: 100,
            borderBottom: "4px solid #c9a961",
            borderRight: "4px solid #c9a961",
          }}
        />

        {/* ─── المحتوى الرئيسي ─── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#a88847",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            Welcome To
          </div>

          <div
            style={{
              fontSize: 180,
              fontWeight: 700,
              color: "#c9a961",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Lumière
          </div>

          <div
            style={{
              fontSize: 28,
              color: "#6b6b6b",
              letterSpacing: "0.1em",
              marginTop: 10,
            }}
          >
            Fine Dining · Reservation System
          </div>

          {/* ─── خط ذهبي تحت النص ─── */}
          <div
            style={{
              width: 200,
              height: 3,
              background: "#c9a961",
              marginTop: 20,
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}