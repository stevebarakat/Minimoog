import React from "react";
import styles from "../PresetsDropdown.module.css";
import { useToast } from "@/components/Toast/hooks/useToast";

type CategoryFilterProps = {
  selectedCategory: string;
  categories?: string[]; // Make optional for safety
  onChange: (category: string) => void;
};

export function CategoryFilter({
  selectedCategory,
  categories,
  onChange,
}: CategoryFilterProps) {
  const showToast = useToast();

  React.useEffect(() => {
    if (!Array.isArray(categories) || categories.length === 0) {
      showToast({
        title: "Category Error",
        description: "No categories available. Please check your preset data.",
        variant: "error",
      });
    }
    // Only run when categories changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  if (!Array.isArray(categories) || categories.length === 0) {
    return (
      <div className={styles.categoryFilter}>
        <select
          value={selectedCategory}
          onChange={(e) => onChange(e.target.value)}
          className={styles.categorySelect}
          aria-label="Filter by category"
        >
          <option value="">No categories</option>
        </select>
      </div>
    );
  }
  return (
    <div className={styles.categoryFilter}>
      <select
        value={selectedCategory}
        onChange={(e) => onChange(e.target.value)}
        className={styles.categorySelect}
        aria-label="Filter by category"
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}
