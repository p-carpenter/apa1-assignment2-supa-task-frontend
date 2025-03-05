import React from 'react';
import FilterSection from './FilterSection';

const SortControls = ({ sortOrder, onSortChange }) => {
  return (
    <FilterSection title="Sort by">
      <div className="sort-controls">
        <select
          className="sort-select"
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="year-desc">Year (Newest first)</option>
          <option value="year-asc">Year (Oldest first)</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="severity-desc">Severity (High-Low)</option>
          <option value="severity-asc">Severity (Low-High)</option>
        </select>
      </div>
    </FilterSection>
  );
};

export default SortControls;
