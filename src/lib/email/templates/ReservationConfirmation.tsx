import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
} from "@react-email/components";
import type { ReservationEmailData } from "../types";
import { generateGoogleCalendarLink } from "../calendar";

// ═══════════════════════════════════════════════════
// 🎨 Translator type — matches next-intl's TFunction shape
// ═══════════════════════════════════════════════════
export type EmailTranslator = (
  key: string,
  values?: Record<string, string | number>
) => string;

// ─── ألوان هوية Lumière ───
const colors = {
  bg: "#faf7f2",
  card: "#ffffff",
  accent: "#c9a961",
  accentDark: "#a88847",
  text: "#1a1a1a",
  muted: "#6b6b6b",
  border: "#e5ddd0",
};

// ═══════════════════════════════════════════════════
// 🌐 Locale → BCP-47 date locale mapping
// ═══════════════════════════════════════════════════
function getDateLocale(locale: string): string {
  const map: Record<string, string> = {
    ar: "ar-EG",
    en: "en-US",
    fr: "fr-FR",
    de: "de-DE",
    es: "es-ES",
    it: "it-IT",
    zh: "zh-CN",
  };
  return map[locale] ?? locale;
}

function formatLocalizedDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(getDateLocale(locale), {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

// ─── Props ───
type Props = Omit<ReservationEmailData, "to"> & {
  locale: string;
  t: EmailTranslator;
};

export function ReservationConfirmation({
  guestName,
  reservationId,
  tableNumber,
  reservationDate,
  guestsCount,
  locale,
  t,
}: Props) {
  const shortId = reservationId.slice(0, 8).toUpperCase();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <Html dir={dir} lang={locale}>
      <Head />
      <Preview>{t("preview", { tableNumber })}</Preview>

      <Body style={body}>
        <Container style={container}>
          {/* ─── الترويسة ─── */}
          <Section style={header}>
            <Heading style={logo}>Lumière</Heading>
            <Text style={tagline}>{t("tagline")}</Text>
          </Section>

          {/* ─── المحتوى ─── */}
          <Section style={content}>
            <Heading as="h1" style={h1}>
              {t("greeting", { guestName })}
            </Heading>
            <Text style={paragraph}>{t("intro")}</Text>

            {/* ─── جدول التفاصيل ─── */}
            <Section style={detailsBox}>
              <DetailRow
                label={t("labelTableNumber")}
                value={t("valueTableNumber", { number: tableNumber })}
                highlight
              />
              <DetailRow
                label={t("labelGuestsCount")}
                value={t("valueGuestsCount", { count: guestsCount })}
              />
              <DetailRow
                label={t("labelDateTime")}
                value={formatLocalizedDate(reservationDate, locale)}
              />
              <DetailRow
                label={t("labelReservationId")}
                value={`#${shortId}`}
              />
            </Section>

            <Text style={paragraph}>{t("closing")}</Text>

            <Text style={paragraph}>
              {t("signatureRegards")}
              <br />
              <strong style={{ color: colors.accentDark }}>
                {t("signatureTeam")}
              </strong>
            </Text>

            <Hr style={hr} />

            {/* ─── زر Google Calendar ─── */}
            <Section style={{ textAlign: "center", marginTop: 24 }}>
              <a
                href={generateGoogleCalendarLink({
                  title: t("calendarTitle", { tableNumber }),
                  description: [
                    t("calendarDescriptionGuests", { count: guestsCount }),
                    t("calendarDescriptionReservationId", { id: shortId }),
                  ].join("\n"),
                  location: t("calendarLocation"),
                  startDate: reservationDate,
                  durationMinutes: 90,
                })}
                style={{
                  display: "inline-block",
                  backgroundColor: colors.accent,
                  color: "#ffffff",
                  padding: "12px 28px",
                  borderRadius: "999px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {t("calendarButton")}
              </a>
            </Section>

            <Hr style={hr} />

            {/* ─── التذييل ─── */}
            <Text style={footer}>
              {t("footerAutoMessage")}
              <br />
              {t("footerContact")}{" "}
              <span dir="ltr">+20 100 000 0000</span>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── صف تفاصيل ───
function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Section style={detailRow}>
      <Text style={detailLabel}>{label}</Text>
      <Text style={highlight ? detailValueHighlight : detailValue}>{value}</Text>
    </Section>
  );
}

// ═══════════════════════════════════════════════════
// الأنماط (Inline Style — إلزامي في الإيميلات)
// ═══════════════════════════════════════════════════
const body: React.CSSProperties = {
  backgroundColor: colors.bg,
  fontFamily:
    "system-ui, -apple-system, 'Segoe UI', Tahoma, Arial, sans-serif",
  padding: "40px 16px",
  margin: 0,
};

const container: React.CSSProperties = {
  backgroundColor: colors.card,
  borderRadius: "16px",
  maxWidth: "560px",
  margin: "0 auto",
  overflow: "hidden",
  border: `1px solid ${colors.border}`,
};

const header: React.CSSProperties = {
  backgroundColor: colors.accent,
  padding: "32px 24px",
  textAlign: "center",
};

const logo: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "bold",
  margin: 0,
  letterSpacing: "1px",
};

const tagline: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "13px",
  margin: "6px 0 0",
  opacity: 0.9,
};

const content: React.CSSProperties = {
  padding: "32px 28px",
};

const h1: React.CSSProperties = {
  color: colors.text,
  fontSize: "22px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  color: colors.text,
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 16px",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: colors.bg,
  borderRadius: "12px",
  padding: "8px 20px",
  margin: "20px 0 24px",
  border: `1px solid ${colors.border}`,
};

const detailRow: React.CSSProperties = {
  borderBottom: `1px solid ${colors.border}`,
  padding: "12px 0",
};

const detailLabel: React.CSSProperties = {
  color: colors.muted,
  fontSize: "13px",
  margin: 0,
};

const detailValue: React.CSSProperties = {
  color: colors.text,
  fontSize: "16px",
  fontWeight: "600",
  margin: "4px 0 0",
};

const detailValueHighlight: React.CSSProperties = {
  ...detailValue,
  color: colors.accentDark,
  fontSize: "20px",
};

const hr: React.CSSProperties = {
  borderColor: colors.border,
  margin: "28px 0 20px",
};

const footer: React.CSSProperties = {
  color: colors.muted,
  fontSize: "12px",
  lineHeight: "1.7",
  textAlign: "center",
  margin: 0,
};