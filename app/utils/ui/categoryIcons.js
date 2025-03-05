export const categoryIcons = {
  Hardware: "🔧", // wrench
  Software: "💻", // laptop
  Network: "🌐", // globe
  Security: "🔒", // lock
  Infrastructure: "🏗️", // building construction
  Database: "💾", // floppy disk
  "UI/UX": "👁️", // eye
  System: "⚙️", // gear
  Game: "🎮", // game controller
  Default: "📁", // folder
};

export const getCategoryIcon = (category) => {
  if (!category) return categoryIcons.Default;
  return categoryIcons[category] || categoryIcons.Default;
};
