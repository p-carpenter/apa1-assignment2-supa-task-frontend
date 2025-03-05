import React, { useState, useRef, useEffect } from 'react';

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
  width = 150
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemSelect = (item) => {
    if (item === allItemsKey) {
      // If 'All' is selected, clear all selections and only select 'All'
      onSelectionChange([allItemsKey]);
    } else {
      let updatedSelection;
      
      if (selectedItems.includes(item)) {
        // If already selected, remove it
        updatedSelection = selectedItems.filter(i => i !== item);
        // If nothing is selected, default to "all"
        if (updatedSelection.length === 0) {
          updatedSelection = [allItemsKey];
        }
        // If "all" was selected, remove it
        else if (updatedSelection.includes(allItemsKey)) {
          updatedSelection = updatedSelection.filter(i => i !== allItemsKey);
        }
      } else {
        // If not selected, add it
        // If "all" was selected, remove it and add the new item
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
      className={`multi-select-dropdown ${className}`} 
      ref={dropdownRef}
      style={{ width: `${width}px` }}
    >
      {label && <div className="dropdown-label">{label}</div>}
      
      <div 
        className="dropdown-header" 
        onClick={toggleDropdown}
      >
        <span className="selected-text">{selectedCount}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      
      {isOpen && (
        <div className="dropdown-options">
          <div
            className={`dropdown-option ${selectedItems.includes(allItemsKey) ? "active" : ""}`}
            onClick={() => handleItemSelect(allItemsKey)}
          >
            {allItemsLabel}
          </div>
          
          {items.map((item) => (
            <div
              key={`item-${getDisplayValue(item)}`}
              className={`dropdown-option ${selectedItems.includes(item) ? "active" : ""}`}
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
