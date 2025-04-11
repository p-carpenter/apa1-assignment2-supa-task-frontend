import React from "react";
import styles from "./Terminal.module.css";

/**
 * Renders the footer of the console with status items
 *
 * @param {Object} props - Component props
 * @param {Array} [props.statusItems=[]] - Items to display in the footer
 *   Each item can be either a string or an object with {text, blink} properties
 */
const ConsoleFooter = ({ statusItems = [] }) => {
  // Use default status items if none provided
  const items = statusItems.length ? statusItems : getDefaultStatusItems();

  return (
    <div className={styles.consoleFooter}>
      {items.map((item, index) => renderStatusItem(item, index))}
    </div>
  );
};

/**
 * Returns default status items if none were provided
 *
 * @returns {Array} Default status items
 */
const getDefaultStatusItems = () => {
  return [
    "TECH INCIDENTS DATABASE",
    "CATALOG VIEW",
    { text: "0 RECORDS RETRIEVED", blink: true },
  ];
};

/**
 * Renders a single status item
 *
 * @param {string|Object} item - Status item to render
 * @param {number} index - Item index for key
 * @returns {JSX.Element} Status item element
 */
const renderStatusItem = (item, index) => {
  // Handle string format
  if (typeof item === "string") {
    return (
      <div key={index} className={styles.statusItem}>
        {item}
      </div>
    );
  }

  // Handle object format with optional blinking
  return (
    <div
      data-testid="status-item"
      key={index}
      className={`${styles.statusItem} ${item.blink ? styles.blinkSlow : ""}`}
    >
      {item.text}
    </div>
  );
};

export default ConsoleFooter;
