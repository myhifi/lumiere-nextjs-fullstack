import Link from "next/link";

type StatCardProps = {
  icon: string;
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  accent?: boolean;
};

export function StatCard({
  icon,
  label,
  value,
  hint,
  href,
  accent,
}: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        {hint && (
          <span className="text-xs text-muted bg-background px-2 py-1 rounded-full">
            {hint}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold mb-1 text-accent-dark">{value}</div>
      <div className="text-sm text-muted">{label}</div>
    </>
  );

  const baseClasses = `block bg-card border border-border rounded-2xl p-6 transition-all ${
    accent ? "border-accent/40 bg-accent-light/30" : ""
  }`;

  // لو وُجد href → رابط تفاعلي. وإلا → بطاقة ثابتة.
  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClasses} hover:border-accent hover:shadow-md cursor-pointer`}
      >
        {content}
      </Link>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}