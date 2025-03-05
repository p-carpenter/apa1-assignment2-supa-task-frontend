import React from 'react';
import FilterSection from './FilterSection';

const SortControls = ({ sortOrder, onSortChange }) => {
  return (
    <FilterSection title="Sort">
      <div className="sort-controls">
        <select
          className="sort-select"
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="year-desc">Newest</option>
          <option value="year-asc">Oldest</option>
          <option value="name-asc">A-Z</option>
          <option value="name-desc">Z-A</option>
          <option value="severity-desc">Severity ↓</option>
          <option value="severity-asc">Severity ↑</option>
        </select>
      </div>
    </FilterSection>
  );
};

export default SortControls;
