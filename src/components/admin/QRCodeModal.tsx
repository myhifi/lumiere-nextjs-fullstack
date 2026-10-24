"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { generateTableQRCode } from "@/actions/qrcode";
import { X, Download, Printer, QrCode } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  locale: string;
};

export function QRCodeModal({ isOpen, onClose, tableNumber, locale }: Props) {
  const t = useTranslations("Admin.tables");
  const [qrData, setQrData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    let isMounted = true;

    const fetchQr = async () => {
      setIsLoading(true);
      const res = await generateTableQRCode(locale, tableNumber);
      
      if (isMounted && res.success && res.dataUrl) {
        setQrData(res.dataUrl);
      }
      if (isMounted) setIsLoading(false);
    };

    fetchQr();

    return () => { isMounted = false; };
  }, [isOpen, locale, tableNumber]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (!qrData) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html dir="${locale === "ar" ? "rtl" : "ltr"}">
        <head>
          <title>Table ${tableNumber} QR</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #1a1a1a; margin-bottom: 10px; }
            p { color: #6b6b6b; margin-bottom: 30px; }
            img { width: 300px; height: 300px; border: 2px solid #e5ddd0; border-radius: 16px; padding: 20px; }
            .brand { color: #c9a961; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="brand">Lumière</div>
          <h1>${t("scanToOrder")}</h1>
          <p>${t("qrModalTitle", { number: tableNumber })}</p>
          <img src="${qrData}" />
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted hover:text-foreground hover:bg-background rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">{t("qrModalTitle", { number: tableNumber })}</h2>
          <p className="text-sm text-muted">{t("qrModalDesc", { number: tableNumber })}</p>
        </div>

        <div className="flex justify-center mb-8">
          {isLoading ? (
            <div className="w-64 h-64 bg-background animate-pulse rounded-xl flex items-center justify-center text-muted">
              <QrCode className="w-8 h-8 opacity-20" />
            </div>
          ) : qrData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrData} alt="QR Code" className="w-64 h-64 border border-border rounded-xl p-2 bg-white" />
          ) : (
            <div className="w-64 h-64 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-sm">
              Failed to load
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            disabled={!qrData}
            className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            <Printer className="w-5 h-5" />
            {t("printQr")}
          </button>
          
          <a
            href={qrData || "#"}
            download={`lumiere-table-${tableNumber}.png`}
            className={`flex-1 flex items-center justify-center gap-2 border border-border hover:bg-background py-3 rounded-xl font-medium transition-colors ${!qrData ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Download className="w-5 h-5" />
            {t("downloadQr")}
          </a>
        </div>
      </div>
    </div>
  );
}