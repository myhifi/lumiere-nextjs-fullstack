// ═══════════════════════════════════════════════════
// 📅 Google Calendar Link Generator
// ═══════════════════════════════════════════════════
// يُولّد رابطاً يفتح Google Calendar مع تفاصيل الحجز
// لا يحتاج API key — مجاني 100%

type CalendarEventParams = {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  durationMinutes: number;
};

/**
 * يُولّد رابط "Add to Google Calendar" جاهز للاستخدام في الإيميل
 */
export function generateGoogleCalendarLink(
  params: CalendarEventParams
): string {
  const { title, description, location, startDate, durationMinutes } = params;

  const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);

  // الصيغة المطلوبة: YYYYMMDDTHHmmss (بالتوقيت المحلي بدون Z)
  const formatDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}${month}${day}T${hours}${minutes}00`;
  };

  const dates = `${formatDate(startDate)}/${formatDate(endDate)}`;

  const searchParams = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates,
    details: description,
    location,
  });

  return `https://calendar.google.com/calendar/render?${searchParams.toString()}`;
}