import React, { useState, useRef, useEffect } from "react";
import styles from "./Filters.module.css";

/**
 * Multi-select dropdown component with "All" option functionality
 * 
 * Maintains a logically consistent state where:
 * - "All" option cannot coexist with other selections
 * - Empty selection automatically defaults to "All"
 * - Automatically closes when clicking outside for cleaner UX
 *
 * @param {Object} props - Component props 
 * @param {string} [props.label] - Category label
 * @param {Array} [props.items=[]] - Selection options
 * @param {Array} [props.selectedItems=[]] - Current selections
 * @param {Function} props.onSelectionChange - Selection handler
 * @param {string} [props.allItemsKey="all"] - "All" option identifier
 * @param {string} [props.allItemsLabel="All"] - "All" option text
 * @param {Function} [props.getDisplayValue] - Display value extractor
 * @param {Function} [props.renderItem] - Custom item renderer
 * @param {string} [props.className=""] - Additional CSS classes
 * @param {number} [props.width=150] - Width in pixels
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

  // Separate effect with single responsibility - outside click handling
  useEffect(() => {
    const handleClickOutside = (outsideClickEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(outsideClickEvent.target)) {
        setIsOpen(false);
      }
    };
    
    // Register for global mousedown events to detect clicks outside component 
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Pure function to get selection when "All" is clicked
  const handleAllItemSelect = () => [allItemsKey];

  // Pure function to handle item removal and maintain logical selection state
  const handleItemDeselect = (itemToRemove) => {
    const updatedSelection = selectedItems.filter((item) => item !== itemToRemove);

    // Auto-select "All" when removing the last filter
    if (updatedSelection.length === 0) return [allItemsKey];
    
    // Remove "All" if it's present with other selections (logically inconsistent)
    if (updatedSelection.includes(allItemsKey)) {
      return updatedSelection.filter((item) => item !== allItemsKey);
    }

    return updatedSelection;
  };

  // Pure function to add an item to selection - "All" handling included
  const handleItemSelect = (itemToAdd) => {
    // When "All" is selected and user picks another item, replace "All" with the selection
    if (selectedItems.includes(allItemsKey)) return [itemToAdd];
    
    // Otherwise add to existing selection
    return [...selectedItems, itemToAdd];
  };

  const handleSelectionChange = (toggledItem) => {
    if (toggledItem === allItemsKey) {
      onSelectionChange(handleAllItemSelect());
    } else if (selectedItems.includes(toggledItem)) {
      onSelectionChange(handleItemDeselect(toggledItem));
    } else {
      onSelectionChange(handleItemSelect(toggledItem));
    }
  };

  // Create user-friendly indicator of current selection state
  const selectionSummary = selectedItems.includes(allItemsKey)
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
        {selectionSummary}
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
            onClick={() => handleSelectionChange(allItemsKey)}
          >
            {allItemsLabel}
          </div>

          {items.map((item) => (
            <div
              data-testid="dropdown-option"
              key={`item-${getDisplayValue(item)}`}
              className={`${styles.dropdownOption} ${selectedItems.includes(item) ? styles.selected : ""}`}
              onClick={() => handleSelectionChange(item)}
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
