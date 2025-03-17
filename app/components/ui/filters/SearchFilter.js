import React from "react";

const SearchFilter = ({
  searchQuery,
  onSearchChange,
  placeholder = "Search incidents...",
}) => {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
      />
    </div>
  );
};

export default SearchFilter;
