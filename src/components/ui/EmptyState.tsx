import { type ReactNode } from "react";

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="p-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      {description && (
        <p className="text-muted text-sm mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action}
    </div>
  );
}