import React from "react";

const categoryIcons = {
  Hardware: "🔧", // wrench
  Software: "💻", // laptop
  "Human Error": "👤", // person
  Security: "🔒", // lock
  Infrastructure: "🏗️", // building construction
  "External Factor": "🌍", // earth globe
};

/**
 * Returns a category icon component
 * @param {string} category - Category name
 * @returns {React.JSX.Element} - Icon span element
 */
export const getCategoryIcon = (category) => {
  const icon = category ? categoryIcons[category] || "❓" : "❓";

  return (
    <span role="img" aria-label={category || "Category"}>
      {icon}
    </span>
  );
};
