import React from "react";
import styles from "./Filters.module.css";

/**
 * Renders a search input field with label for filtering incidents
 * Provides real-time search capability with customisable placeholder text
 *
 * @param {string} props.searchQuery - Current search query string
 * @param {Function} props.onSearchChange - Handler function called when search input changes
 * @param {string} [props.placeholder="Search incidents..."] - Placeholder text to display in empty search field
 */
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
