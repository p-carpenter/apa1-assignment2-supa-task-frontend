import React, { useState, useRef, useEffect } from "react";
import styles from "./Filters.module.css";

/**
 * A reusable multi-select dropdown component
 *
 * @param {Object} props
 * @param {string} props.label - Optional label for the dropdown
 * @param {Array} props.items - Array of items to show in the dropdown
 * @param {Array} props.selectedItems - Array of currently selected items
 * @param {Function} props.onSelectionChange - Callback when selection changes
 * @param {string} props.allItemsKey - Value for the "All" option (default: "all")
 * @param {string} props.allItemsLabel - Display text for the "All" option (default: "All")
 * @param {Function} props.getDisplayValue - Function to get display value from item (default: item => item)
 * @param {Function} props.renderItem - Custom renderer for each item (optional)
 * @param {string} props.className - Additional CSS class (optional)
 * @param {number} props.width - Fixed width for the dropdown (default: 150px)
 */
const MultiSelectDropdown = ({
  label,
  items = [],
  selectedItems = [],
  onSelectionChange,
  allItemsKey = "all",
  allItemsLabel = "All",
  getDisplayValue = (item) => item,
  renderItem = null,
  className = "",
  width = 150,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemSelect = (item) => {
    if (item === allItemsKey) {
      onSelectionChange([allItemsKey]);
    } else {
      let updatedSelection;

      if (selectedItems.includes(item)) {
        updatedSelection = selectedItems.filter((i) => i !== item);

        if (updatedSelection.length === 0) {
          updatedSelection = [allItemsKey];
        } else if (updatedSelection.includes(allItemsKey)) {
          updatedSelection = updatedSelection.filter((i) => i !== allItemsKey);
        }
      } else {
        if (selectedItems.includes(allItemsKey)) {
          updatedSelection = [item];
        } else {
          updatedSelection = [...selectedItems, item];
        }
      }

      onSelectionChange(updatedSelection);
    }
  };

  const selectedCount = selectedItems.includes(allItemsKey)
    ? allItemsLabel
    : `${selectedItems.length} selected`;

  return (
    <div
      className={`${styles.multiSelectDropdown} ${className}`}
      ref={dropdownRef}
      style={{ width: `${width}px` }}
    >
      {label && <div className={styles.dropdownLabel}>{label}</div>}

      <div
        className={styles.sortSelect}
        onClick={toggleDropdown}
        data-testid="dropdown-header"
      >
        {selectedCount}
        <span
          className={`${styles.dropdownArrow} ${isOpen ? styles.open : ""}`}
        >
          ▼
        </span>
      </div>

      {isOpen && (
        <div className={styles.dropdownOptions}>
          <div
            className={`${styles.dropdownOption} ${selectedItems.includes(allItemsKey) ? styles.selected : ""}`}
            onClick={() => handleItemSelect(allItemsKey)}
          >
            {allItemsLabel}
          </div>

          {items.map((item) => (
            <div
              data-testid="dropdown-option"
              key={`item-${getDisplayValue(item)}`}
              className={`${styles.dropdownOption} ${selectedItems.includes(item) ? styles.selected : ""}`}
              onClick={() => handleItemSelect(item)}
            >
              {renderItem ? renderItem(item) : getDisplayValue(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
