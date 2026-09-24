"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type CategoryFilterProps = {
  categories: Category[];
};

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("category");

  function handleFilter(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
      <FilterButton
        label="الكل"
        isActive={!activeSlug}
        onClick={() => handleFilter(null)}
      />
      {categories.map((cat) => (
        <FilterButton
          key={cat.id}
          label={cat.name}
          isActive={activeSlug === cat.slug}
          onClick={() => handleFilter(cat.slug)}
        />
      ))}
    </div>
  );
}

// زر فرعي (Private) — يستخدم فقط داخل هذا الملف
function FilterButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
        isActive
          ? "bg-accent text-white border-accent shadow-sm"
          : "bg-card text-foreground border-border hover:border-accent hover:text-accent"
      }`}
    >
      {label}
    </button>
  );
}