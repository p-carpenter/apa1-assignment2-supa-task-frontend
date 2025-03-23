import React from "react";
import styles from "./Filters.module.css";

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
