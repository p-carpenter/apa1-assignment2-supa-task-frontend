import React from "react";
import ConsoleSection from "../console/ConsoleSection";
import SearchFilter from "./SearchFilter";
import MultiSelectDropdown from "./MultiSelectDropdown.jsx";
import SortControls from "./SortControls";
import { getCategoryIcon } from "../../../utils/ui/categoryIcons";
import styles from "./Filters.module.css";

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
  const renderCategoryOption = (category) => (
    <>
      {getCategoryIcon(category)} {category}
    </>
  );

  return (
    <ConsoleSection className={styles.catalogFilters}>
      <div className={styles.filtersContainer}>
        <div className={styles.searchContainer}>
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            placeholder="Search incidents by name, description, year or category..."
          />
        </div>
        <MultiSelectDropdown
          label="YEAR"
          items={yearsAvailable}
          selectedItems={selectedYears}
          onSelectionChange={onYearChange}
          allItemsLabel="All Years"
        />
        <MultiSelectDropdown
          label="CATEGORY"
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
