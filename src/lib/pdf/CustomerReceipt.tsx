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
// 🎨 PDF Styles
// ═══════════════════════════════════════════════════
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Cairo", fontSize: 10, color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, borderBottomWidth: 2, borderBottomColor: "#c9a961", paddingBottom: 10 },
  logo: { fontSize: 24, fontWeight: "bold", color: "#c9a961" },
  receiptTitle: { fontSize: 14, color: "#6b6b6b", textAlign: "right" },
  
  infoGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  infoBlock: { flex: 1 },
  infoLabel: { fontSize: 9, color: "#6b6b6b", marginBottom: 3 },
  infoValue: { fontSize: 11, fontWeight: "bold" },

  table: { width: "100%", marginBottom: 30 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5ddd0", paddingBottom: 5, marginBottom: 5 },
  tableHeaderCell: { fontSize: 9, fontWeight: "bold", color: "#6b6b6b" },
  tableRow: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#faf7f2" },
  tableCell: { fontSize: 10 },
  
  colName: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1, textAlign: "right" },

  totalContainer: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  totalBox: { width: "40%", flexDirection: "row", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 2, borderTopColor: "#c9a961" },
  totalLabel: { fontSize: 12, fontWeight: "bold" },
  totalValue: { fontSize: 12, fontWeight: "bold", color: "#a88847" },

  footer: { position: "absolute", bottom: 40, left: 40, right: 40, textAlign: "center", color: "#6b6b6b", fontSize: 9, borderTopWidth: 1, borderTopColor: "#e5ddd0", paddingTop: 10 }
});

type Props = {
  order: PdfOrderData;
  t: (key: string, values?: Record<string, string | number>) => string;
  locale: string;
};

export function CustomerReceipt({ order, t, locale }: Props) {
  const isRtl = locale === "ar";

  return (
    <Document>
      <Page size="A4" style={[styles.page, { direction: isRtl ? "rtl" : "ltr" }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Lumière</Text>
          <View>
            <Text style={styles.receiptTitle}>{t("receipt")}</Text>
            <Text style={{ fontSize: 9, color: "#6b6b6b" }}>#{order.shortId}</Text>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>{t("billedTo")}</Text>
            <Text style={styles.infoValue}>{order.guestName}</Text>
            <Text style={{ fontSize: 9, color: "#6b6b6b" }}>{order.guestEmail}</Text>
            {order.guestPhone && <Text style={{ fontSize: 9, color: "#6b6b6b" }}>{order.guestPhone}</Text>}
          </View>
          
          <View style={[styles.infoBlock, { alignItems: isRtl ? "flex-start" : "flex-end" }]}>
            <Text style={styles.infoLabel}>{t("date")}</Text>
            <Text style={styles.infoValue}>{order.date}</Text>
            <Text style={styles.infoLabel}>{t("paymentMethod")}</Text>
            <Text style={styles.infoValue}>{order.paymentMethod}</Text>
          </View>
        </View>

        {/* Fulfillment Info */}
        <View style={{ marginBottom: 30, padding: 10, backgroundColor: "#faf7f2", borderRadius: 4 }}>
          <Text style={styles.infoLabel}>
            {order.deliveryAddress ? t("deliveryAddress") : t("dineIn")}
          </Text>
          <Text style={styles.infoValue}>
            {order.deliveryAddress ? order.deliveryAddress : `Table ${order.tableNumber}`}
          </Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colName]}>{t("item")}</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>{t("qty")}</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>{t("price")}</Text>
          </View>
          
          {order.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colName]}>{item.name}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colPrice]}>
                {(item.price * item.quantity).toFixed(2)} AED
              </Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalContainer}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>{t("total")}</Text>
            <Text style={styles.totalValue}>{order.totalAmount.toFixed(2)} AED</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          {t("thankYou")} {"\n"}
          Lumière Restaurant · Qaryat El Asad - Cairo-Alexandria Desert Rd
        </Text>
      </Page>
    </Document>
  );
}