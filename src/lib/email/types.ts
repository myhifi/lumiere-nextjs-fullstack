// src/lib/email/types.ts
// ═══════════════════════════════════════════════════
// 📧 أنواع نظام الإيميل
// ═══════════════════════════════════════════════════

export type EmailProviderName = "console" | "resend";

export type ReservationEmailData = {
  to: string;
  guestName: string;
  reservationId: string;
  tableNumber: number;
  reservationDate: Date;
  guestsCount: number;
};

export type SendEmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

// ─── Order confirmation email ───
export type OrderEmailItem = {
  name: string;
  quantity: number;
  priceAtOrder: number;
};

export type OrderEmailData = {
  to: string;
  guestName: string;
  orderId: string;
  items: OrderEmailItem[];
  totalAmount: number;
  deliveryAddress: string;
  locale: string;
};