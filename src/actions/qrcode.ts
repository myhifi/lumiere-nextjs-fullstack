// src/actions/qrcode.ts
"use server";

import QRCode from "qrcode";

export async function generateTableQRCode(locale: string, tableNumber: number) {
  try {
    // 1. Determine the base URL (Production vs Local)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    // 2. Construct the exact URL the customer will visit
    // e.g., https://lumiere.com/en/menu?table=5
    const targetUrl = `${baseUrl}/${locale}/menu?table=${tableNumber}`;

    // 3. Generate the QR Code as a Base64 Data URL
    const dataUrl = await QRCode.toDataURL(targetUrl, {
      width: 600,              // High resolution for printing
      margin: 2,               // White space around the QR
      color: {
        dark: "#1a1a1a",       // Lumière dark gray (matches your UI)
        light: "#ffffff",      // White background
      },
    });

    return { success: true, dataUrl, targetUrl };
  } catch (error) {
    console.error("[generateTableQRCode] error:", error);
    return { success: false, error: "Failed to generate QR Code" };
  }
}