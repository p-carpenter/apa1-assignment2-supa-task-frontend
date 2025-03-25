import React from "react";

const categoryIcons = {
  Hardware: "🔧",
  Software: "💻",
  "Human Error": "👤",
  Security: "🔒",
  Infrastructure: "🏗️",
  "External Factors": "🌍",
};

/**
 * Returns a category icon component for use in 2000sDetailsWindow.jsx
 * @param {string} category - Category name
 * @returns {JSX.Element} - Icon span element
 */
export const getCategoryIcon = (category) => {
  const icon = category ? categoryIcons[category] || "❓" : "❓";

  return (
    <span role="img" aria-label={category || "Category"}>
      {icon}
    </span>
  );
};
