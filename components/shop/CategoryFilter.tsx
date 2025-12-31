"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Category } from "@/lib/api/category";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId?: string;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Local state for instant UI update
  const [localSelectedId, setLocalSelectedId] = useState<string | undefined>(
    selectedCategoryId
  );

  // Sync with URL when it changes externally
  useEffect(() => {
    setLocalSelectedId(selectedCategoryId);
  }, [selectedCategoryId]);

  const handleCategoryChange = (categoryId: string | null) => {
    // INSTANT UI UPDATE - Change local state immediately
    setLocalSelectedId(categoryId || undefined);

    const params = new URLSearchParams(searchParams.toString());

    if (categoryId) {
      params.set("categoryId", categoryId);
    } else {
      params.delete("categoryId");
    }

    // Reset to page 1 when changing category
    params.delete("page");

    // Update URL immediately without waiting
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  // Display all categories dynamically from backend (100% dynamic, zero static data)
  const displayCategories = [
    { id: null, name: "All products", slug: "all" },
    ...categories
      .filter((cat) => cat.isActive) // Only show active categories
      .map((cat) => ({
        id: cat.id,
        name: cat.name, // Use category name directly from backend
        slug: cat.slug,
      })),
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-h2 font-bold text-foreground mb-4">All Products</h2>
      <p className="text-body-md text-foreground-secondary mb-6">
        Shop now, not later. Browse the best of our favorite sale styles and
        brands.
      </p>

      <div className="space-y-2">
        {displayCategories.map((category) => {
          // Use local state for instant visual feedback
          const isSelected =
            category.id === null
              ? !localSelectedId
              : category.id === localSelectedId;

          return (
            <label
              key={category.id || "all"}
              className={`flex items-center cursor-pointer group rounded-md transition-all ${
                isSelected
                  ? "bg-blue-600 px-3 py-2"
                  : "px-3 py-2 hover:bg-neutral-50"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={category.id || ""}
                checked={isSelected}
                onChange={(e) => {
                  e.preventDefault();
                  handleCategoryChange(category.id);
                }}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  isSelected
                    ? "border-white bg-white"
                    : "border-neutral-400 bg-white"
                }`}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-foreground" />
                )}
              </div>
              <span
                className={`ml-3 text-body-md transition-colors ${
                  isSelected
                    ? "text-white font-medium"
                    : "text-foreground-secondary group-hover:text-foreground"
                }`}
              >
                {category.name}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
