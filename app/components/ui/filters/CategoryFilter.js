import React from "react";
import FilterSection from "./FilterSection";
import { getCategoryIcon } from "../../../utils/ui/categoryIcons";

const CategoryFilter = ({ activeCategory, categories, onCategoryChange }) => {
  return (
    <FilterSection title="Filter by Category">
      <div className="category-filters">
        <div
          className={`category-filter ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => onCategoryChange("all")}
        >
          {getCategoryIcon("Default")} All
        </div>
        {categories.map((category) => (
          <div
            key={`cat-${category}`}
            className={`category-filter ${activeCategory === category ? "active" : ""}`}
            onClick={() => onCategoryChange(category)}
          >
            {getCategoryIcon(category)} {category}
          </div>
        ))}
      </div>
    </FilterSection>
  );
};

export default CategoryFilter;
