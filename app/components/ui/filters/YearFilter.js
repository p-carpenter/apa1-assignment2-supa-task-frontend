import React from 'react';
import FilterSection from './FilterSection';

const YearFilter = ({ activeYear, yearsAvailable, onYearChange }) => {
  return (
    <FilterSection title="Filter by Year">
      <div className="filter-tabs">
        <div
          key="all-years"
          className={`filter-tab ${activeYear === "all" ? "active" : ""}`}
          onClick={() => onYearChange("all")}
        >
          ALL YEARS
        </div>
        {yearsAvailable.map((year) => (
          <div
            key={`year-${year}`}
            className={`filter-tab ${activeYear === year ? "active" : ""}`}
            onClick={() => onYearChange(year)}
          >
            {year}
          </div>
        ))}
      </div>
    </FilterSection>
  );
};

export default YearFilter;
