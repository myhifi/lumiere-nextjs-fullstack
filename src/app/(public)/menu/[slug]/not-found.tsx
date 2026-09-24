import Link from "next/link";

export default function MenuItemNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="text-8xl mb-6">🍽️</div>
      <h1 className="text-3xl font-bold mb-4">الطبق غير موجود</h1>
      <p className="text-muted mb-8">
        ربما تم حذف هذا الطبق أو أن الرابط غير صحيح.
      </p>
      <Link
        href="/menu"
        className="inline-block bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors"
      >
        العودة إلى القائمة
      </Link>
    </div>
  );
}