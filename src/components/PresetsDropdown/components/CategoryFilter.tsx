import React from "react";
import styles from "../PresetsDropdown.module.css";

type CategoryFilterProps = {
  selectedCategory: string;
  categories: string[];
  onChange: (category: string) => void;
};

export function CategoryFilter({
  selectedCategory,
  categories,
  onChange,
}: CategoryFilterProps) {
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
