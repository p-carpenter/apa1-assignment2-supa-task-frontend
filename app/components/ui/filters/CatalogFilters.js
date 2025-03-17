import React from "react";
import ConsoleSection from "../console/ConsoleSection";
import SearchFilter from "./SearchFilter";
import MultiSelectDropdown from "../shared/MultiSelectDropdown";
import SortControls from "./SortControls";
import { getCategoryIcon } from "../../../utils/ui/categoryIcons";
import "@/app/catalog/catalog.styles.css";

const CatalogFilters = ({
  searchQuery,
  onSearchChange,
  selectedYears,
  yearsAvailable,
  onYearChange,
  selectedCategories,
  categories,
  onCategoryChange,
  sortOrder,
  onSortChange,
}) => {
  // Custom renderer for category items to include icons
  const renderCategoryOption = (category) => (
    <>
      {getCategoryIcon(category)} {category}
    </>
  );

  return (
    <ConsoleSection className="catalog-filters">
      <div className="filters-container">
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          placeholder="Search incidents by name, description, year or category..."
        />

        <div className="filter-item">
          <MultiSelectDropdown
            label="YEAR"
            items={yearsAvailable}
            selectedItems={selectedYears}
            onSelectionChange={onYearChange}
            allItemsLabel="All Years"
          />
        </div>

        <div className="filter-item">
          <MultiSelectDropdown
            label="CATEGORY"
            items={categories}
            selectedItems={selectedCategories}
            onSelectionChange={onCategoryChange}
            renderItem={renderCategoryOption}
          />
        </div>

        <SortControls sortOrder={sortOrder} onSortChange={onSortChange} />
      </div>
    </ConsoleSection>
  );
};

export default CatalogFilters;
