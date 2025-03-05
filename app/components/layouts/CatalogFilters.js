import React from 'react';
import ConsoleSection from '../ui/console/ConsoleSection';
import SearchFilter from '../ui/filters/SearchFilter';
import YearFilter from '../ui/filters/YearFilter';
import CategoryFilter from '../ui/filters/CategoryFilter';
import SortControls from '../ui/filters/SortControls';

const CatalogFilters = ({
  searchQuery,
  onSearchChange,
  activeYear,
  yearsAvailable,
  onYearChange,
  activeCategory,
  categories,
  onCategoryChange,
  sortOrder,
  onSortChange
}) => {
  return (
    <ConsoleSection
      className="catalog-filters"
      command="set_filters --advanced"
    >
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      
      <YearFilter
        activeYear={activeYear}
        yearsAvailable={yearsAvailable}
        onYearChange={onYearChange}
      />
      
      <CategoryFilter
        activeCategory={activeCategory}
        categories={categories}
        onCategoryChange={onCategoryChange}
      />
      
      <SortControls
        sortOrder={sortOrder}
        onSortChange={onSortChange}
      />
    </ConsoleSection>
  );
};

export default CatalogFilters;
