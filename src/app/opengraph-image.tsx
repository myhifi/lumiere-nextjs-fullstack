import { ImageResponse } from "next/og";

// ═══════════════════════════════════════════════════
// 🖼️ OG Image — يُولَّد تلقائياً لكل صفحة
// ═══════════════════════════════════════════════════

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Lumière — Fine Dining Restaurant";
export const dynamic = "force-static";

const colors = {
  bg: "#faf7f2",
  card: "#ffffff",
  accent: "#c9a961",
  accentDark: "#a88847",
  accentLight: "#f5ecd9",
  text: "#1a1a1a",
  muted: "#6b6b6b",
  border: "#e5ddd0",
};

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: colors.bg,
          position: "relative",
          padding: "70px 90px",
        }}
      >
        {/* ─── زخرفة علوية يسرى — بعيدة عن المحتوى ─── */}
        <div
          style={{
            position: "absolute",
            top: 25,
            left: 25,
            width: 60,
            height: 60,
            borderTop: `3px solid ${colors.accent}`,
            borderLeft: `3px solid ${colors.accent}`,
          }}
        />

        {/* ─── زخرفة سفلية يمنى ─── */}
        <div
          style={{
            position: "absolute",
            bottom: 25,
            right: 25,
            width: 60,
            height: 60,
            borderBottom: `3px solid ${colors.accent}`,
            borderRight: `3px solid ${colors.accent}`,
          }}
        />

        {/* ═══ الصف العلوي: Badge + Host ═══ */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: colors.accentLight,
              color: colors.accentDark,
              padding: "10px 24px",
              borderRadius: 999,
              fontSize: 17,
              fontWeight: 600,
              letterSpacing: "0.08em",
            }}
          >
            Est. 2026
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 15,
              color: colors.muted,
              letterSpacing: "0.05em",
            }}
          >
            lumiere-nextjs-fullstack.vercel.app
          </div>
        </div>

        {/* ═══ القسم الوسطي ═══ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: colors.accentDark,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            Welcome To
          </div>

          <div
            style={{
              fontSize: 160,
              fontWeight: 700,
              color: colors.accent,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Lumière
          </div>

          <div
            style={{
              fontSize: 24,
              color: colors.muted,
              letterSpacing: "0.1em",
              marginTop: 8,
            }}
          >
            Fine Dining · Reservation System
          </div>
        </div>

        {/* ═══ القسم السفلي: Avatar + Name + CTA ═══ */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
            paddingTop: 24,
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          {/* Avatar + الاسم */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: colors.accent,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              MY
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 600, color: colors.text }}>
                Mohamed Yehia
              </div>
              <div style={{ fontSize: 14, color: colors.muted }}>
                Full-Stack Developer
              </div>
            </div>
          </div>

          {/* CTA Button — بدون سهم، أوسع padding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: colors.text,
              color: "#ffffff",
              padding: "16px 40px",
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "0.08em",
            }}
          >
            Reserve a Table
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}