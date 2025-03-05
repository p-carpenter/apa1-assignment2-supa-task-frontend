import React from "react";
import ConsoleSection from "../ui/console/ConsoleSection";
import SearchFilter from "../ui/filters/SearchFilter";
import MultiSelectDropdown from "../ui/MultiSelectDropdown";
import SortControls from "../ui/filters/SortControls";
import { getCategoryIcon } from "../../utils/ui/categoryIcons";

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
    <ConsoleSection
      className="catalog-filters"
      command="set_filters --advanced"
    >
      <div className="filters-container">
        <div className="search-container">
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            placeholder="Search incidents by name, description, year or category..."
          />
        </div>

        <MultiSelectDropdown
          label="Year"
          items={yearsAvailable}
          selectedItems={selectedYears}
          onSelectionChange={onYearChange}
          allItemsLabel="All Years"
        />

        <MultiSelectDropdown
          label="Category"
          items={categories}
          selectedItems={selectedCategories}
          onSelectionChange={onCategoryChange}
          renderItem={renderCategoryOption}
        />

        <SortControls sortOrder={sortOrder} onSortChange={onSortChange} />
      </div>
    </ConsoleSection>
  );
};

export default CatalogFilters;
