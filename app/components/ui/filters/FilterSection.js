import React from 'react';

const FilterSection = ({ title, children }) => {
  return (
    <div className="filter-section">
      <div className="filter-header">
        <div className="filter-title">{title}</div>
      </div>
      {children}
    </div>
  );
};

export default FilterSection;
