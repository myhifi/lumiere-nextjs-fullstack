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