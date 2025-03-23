import React from "react";
import styles from "./Filters.module.css";

const SearchFilter = ({
  searchQuery,
  onSearchChange,
  placeholder = "Search incidents...",
}) => {
  return (
    <>
      <div className={styles.dropdownLabel}>SEARCH</div>
      <input
        data-testid="search-input"
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.searchInput}
      />
    </>
  );
};

export default SearchFilter;
