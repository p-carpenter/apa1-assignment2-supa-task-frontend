import React from "react";
import ConsoleSection from "../console/ConsoleSection";
import SearchFilter from "./SearchFilter";
import MultiSelectDropdown from "./MultiSelectDropdown.jsx";
import SortControls from "./SortControls";
import { getCategoryIcon } from "../../../utils/ui/categoryIcons";
import styles from "./Filters.module.css";

/**
 * Renders a complete set of filter controls for the incident catalog
 * Combines search, multi-select dropdowns for years and categories, and sort controls
 *
 * @param {string} props.searchQuery - Current search query string
 * @param {Function} props.onSearchChange - Handler for when search input changes
 * @param {string[]} props.selectedYears - Array of currently selected year filters
 * @param {string[]} props.yearsAvailable - Array of all available years for filtering
 * @param {Function} props.onYearChange - Handler for when year selection changes
 * @param {string[]} props.selectedCategories - Array of currently selected category filters
 * @param {string[]} props.categories - Array of all available categories for filtering
 * @param {Function} props.onCategoryChange - Handler for when category selection changes
 * @param {string} props.sortOrder - Current sort order (format: "field-direction")
 * @param {Function} props.onSortChange - Handler for when sort selection changes
 */
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
