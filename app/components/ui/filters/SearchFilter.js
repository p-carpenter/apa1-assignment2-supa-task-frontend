import React from 'react';

const SearchFilter = ({ searchQuery, setSearchQuery, placeholder = "Search incidents..." }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      {searchQuery && (
        <button 
          className="clear-button" 
          onClick={() => setSearchQuery("")}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SearchFilter;
