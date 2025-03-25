import React from "react";
import styles from "./Filters.module.css";

/**
 * Renders a dropdown select control for sorting incident data
 * Provides options for sorting by date, name, and severity in ascending or descending order
 *
 * @param {string} props.sortOrder - Current sort order value in format "field-direction" (e.g., "year-desc")
 * @param {Function} props.onSortChange - Handler function called when sort selection changes
 */
const SortControls = ({ sortOrder, onSortChange }) => {
  return (
    <div className={styles.multiSelectDropdown}>
      <div className={styles.dropdownLabel}>SORT</div>
      <select
        className={styles.sortSelect}
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
  );
};

export default SortControls;
