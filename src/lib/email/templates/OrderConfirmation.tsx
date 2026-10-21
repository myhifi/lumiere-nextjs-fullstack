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
  Row,
  Column,
} from "@react-email/components";
import type { OrderEmailData } from "../types";
import type { EmailTranslator } from "./ReservationConfirmation";

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

type Props = OrderEmailData & {
  t: EmailTranslator;
  whatsappNumber: string;
  appUrl: string;
};

export function OrderConfirmation({
  guestName,
  orderId,
  items,
  totalAmount,
  deliveryAddress,
  locale,
  t,
  whatsappNumber,
  appUrl,
}: Props) {
  const shortId = orderId.slice(0, 8).toUpperCase();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const trackLink = `${appUrl}/${locale}/track-order?id=${orderId}`;

  return (
    <Html dir={dir} lang={locale}>
      <Head />
      <Preview>{t("preview")}</Preview>

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

            {/* ─── تفاصيل الطلب ─── */}
            <Section style={detailsBox}>
              <Text style={{ ...paragraph, marginBottom: "16px", fontSize: "14px" }}>
                <strong>{t("labelOrderId")}:</strong> <span style={{ fontFamily: "monospace", color: colors.accentDark }}>#{shortId}</span>
              </Text>
              <Row style={headerRow}>
                <Column style={colName}>{t("labelItems")}</Column>
                <Column style={colQty}>{t("itemsHeaderQty")}</Column>
                <Column style={colPrice}>{t("labelTotal")}</Column>
              </Row>
              
              {items.map((item, index) => (
                <Row key={index} style={itemRow}>
                  <Column style={colName}>{item.name}</Column>
                  <Column style={colQty}>{item.quantity}</Column>
                  <Column style={colPrice}>
                    {(item.priceAtOrder * item.quantity).toFixed(2)} AED
                  </Column>
                </Row>
              ))}

              <Row style={totalRow}>
                <Column style={colName}></Column>
                <Column style={colQty}></Column>
                <Column style={colPriceTotal}>
                  {totalAmount.toFixed(2)} AED
                </Column>
              </Row>
            </Section>

            {/* ─── معلومات التوصيل ─── */}
            <Section style={deliveryBox}>
              <Text style={detailLabel}>{t("labelDeliveryAddress")}</Text>
              <Text style={detailValue}>{deliveryAddress}</Text>
            </Section>

            <Hr style={hr} />

            {/* ─── زر تتبع الطلب ─── */}
            <Section style={{ textAlign: "center", marginTop: 24 }}>
              <a href={trackLink} style={button}>
                {t("trackButton")}
              </a>
              <Text style={hint}>{t("trackHint")}</Text>
            </Section>

            <Hr style={hr} />

            {/* ─── التذييل ─── */}
            <Text style={footer}>
              {t("footerAutoMessage")}
              <br />
              {t("footerContact")}{" "}
              <span dir="ltr">+{whatsappNumber}</span>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ═══════════════════════════════════════════════════
// الأنماط
// ═══════════════════════════════════════════════════
const body: React.CSSProperties = {
  backgroundColor: colors.bg,
  fontFamily: "system-ui, -apple-system, 'Segoe UI', Tahoma, Arial, sans-serif",
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
  padding: "16px 20px",
  margin: "20px 0 24px",
  border: `1px solid ${colors.border}`,
};

const headerRow: React.CSSProperties = {
  borderBottom: `1px solid ${colors.border}`,
  paddingBottom: "8px",
  marginBottom: "8px",
};

const itemRow: React.CSSProperties = {
  paddingTop: "8px",
  paddingBottom: "8px",
  borderBottom: `1px solid ${colors.border}`,
};

const totalRow: React.CSSProperties = {
  paddingTop: "12px",
  marginTop: "4px",
};

const colName: React.CSSProperties = { fontSize: "14px", color: colors.text, fontWeight: 500, width: "50%" };
const colQty: React.CSSProperties = { fontSize: "14px", color: colors.muted, width: "15%", textAlign: "center" };
const colPrice: React.CSSProperties = { fontSize: "14px", color: colors.text, width: "35%", textAlign: "right" };
const colPriceTotal: React.CSSProperties = { fontSize: "18px", color: colors.accentDark, fontWeight: "bold", width: "35%", textAlign: "right" };

const deliveryBox: React.CSSProperties = {
  backgroundColor: colors.bg,
  borderRadius: "12px",
  padding: "16px 20px",
  margin: "0 0 24px",
  border: `1px solid ${colors.border}`,
};

const detailLabel: React.CSSProperties = {
  color: colors.muted,
  fontSize: "13px",
  margin: 0,
};

const detailValue: React.CSSProperties = {
  color: colors.text,
  fontSize: "15px",
  fontWeight: "600",
  margin: "4px 0 0",
};

const button: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: colors.accent,
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: "999px",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: 600,
};

const hint: React.CSSProperties = {
  color: colors.muted,
  fontSize: "12px",
  marginTop: "12px",
  lineHeight: "1.5",
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