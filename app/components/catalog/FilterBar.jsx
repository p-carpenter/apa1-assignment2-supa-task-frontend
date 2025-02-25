import React from "react";

const FilterBar = ({
  currentView,
  categories,
  activeFilter,
  onFilterClick,
  onBackClick,
}) => {
  return (
    <div className="filter-bar">
      <div className="flex flex-row gap-3 items-center justify-start">
        {currentView === "incidents" && (
          <button className="win95-folder-nav-button" onClick={onBackClick}>
            <div className="arrow-left"></div>
          </button>
        )}
        <p>Category:</p>
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-button ${activeFilter === category ? "bg-win95blue text-white" : "hover:bg-win95blue hover:text-white"}`}
            onClick={() => onFilterClick(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
