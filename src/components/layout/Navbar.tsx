import Link from "next/link";

// روابط التنقل الرئيسية
// (سنضيف رابط "لوحة التحكم" في المرحلة 8)
const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/menu", label: "القائمة" },
  { href: "/reserve", label: "احجز طاولة" },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* الشعار */}
        <Link
          href="/"
          className="text-2xl font-bold text-accent hover:text-accent-dark transition-colors"
        >
          Lumière
        </Link>

        {/* روابط التنقل */}
        <ul className="flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-foreground/80 hover:text-accent transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}