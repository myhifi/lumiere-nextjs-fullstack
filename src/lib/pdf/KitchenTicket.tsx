
import type { PdfOrderData } from "@/lib/services/pdf";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Register the Arabic font
const fontBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
Font.register({
  family: "Cairo",
  fonts: [
    { src: `${fontBaseUrl}/fonts/Cairo-Regular.ttf` },
    { src: `${fontBaseUrl}/fonts/Cairo-Bold.ttf`, fontWeight: "bold" },
  ],
});

// ═══════════════════════════════════════════════════
// 🎨 Kitchen Ticket Styles (High Contrast, Large Font)
// ═══════════════════════════════════════════════════
const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Cairo", backgroundColor: "#ffffff" },
  header: { borderBottomWidth: 3, borderBottomColor: "#000000", paddingBottom: 10, marginBottom: 20, flexDirection: "row", justifyContent: "space-between" },
  title: { fontSize: 28, fontWeight: "heavy" },
  orderId: { fontSize: 18, fontWeight: "bold" },
  locationBadge: { backgroundColor: "#000000", color: "#ffffff", padding: 8, fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  
  timeLabel: { fontSize: 12, color: "#6b6b6b", marginBottom: 5 },
  timeValue: { fontSize: 16, fontWeight: "bold", marginBottom: 20 },

  table: { width: "100%" },
  tableHeader: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#000000", paddingBottom: 5, marginBottom: 10 },
  tableHeaderCell: { fontSize: 14, fontWeight: "bold" },
  tableRow: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e5ddd0" },
  
  colQty: { width: "15%", fontSize: 20, fontWeight: "heavy", textAlign: "center" },
  colName: { width: "85%", fontSize: 20, fontWeight: "bold" },
  
  footer: { position: "absolute", bottom: 30, left: 30, right: 30, textAlign: "center", color: "#6b6b6b", fontSize: 10, borderTopWidth: 1, borderTopColor: "#e5ddd0", paddingTop: 10 }
});

type Props = {
  order: PdfOrderData;
  t: (key: string, values?: Record<string, string | number>) => string;
  locale: string;
};

export function KitchenTicket({ order, t, locale }: Props) {
  // Kitchens usually prefer standard LTR even in Arabic, but we keep it flexible
  const isRtl = locale === "ar";

  return (
    <Document>
      <Page size="A4" style={[styles.page, { direction: isRtl ? "rtl" : "ltr" }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t("kitchenTicket")}</Text>
          <Text style={styles.orderId}>#{order.shortId}</Text>
        </View>

        {/* Location Badge (Table or Delivery) */}
        <View style={styles.locationBadge}>
          <Text>
            {order.tableNumber ? `TABLE ${order.tableNumber}` : "DELIVERY ORDER"}
          </Text>
        </View>

        {/* Timing */}
        <View>
          <Text style={styles.timeLabel}>{t("orderedAt")}</Text>
          <Text style={styles.timeValue}>{order.date}</Text>
        </View>

        {/* Items List (Huge Text) */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>{t("qty")}</Text>
            <Text style={[styles.tableHeaderCell, styles.colName]}>{t("item")}</Text>
          </View>
          
          {order.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colQty}>{item.quantity}x</Text>
              <Text style={styles.colName}>{item.name}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Lumière Restaurant · Internal Kitchen Document
        </Text>
      </Page>
    </Document>
  );
}