export function LoadingSpinner({ label = "جاري التحميل..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-10 h-10 border-4 border-accent-light border-t-accent rounded-full animate-spin" />
      <p className="text-muted text-sm">{label}</p>
    </div>
  );
}