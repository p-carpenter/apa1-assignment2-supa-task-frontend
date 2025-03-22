export const SEVERITY_STYLES = {
  critical: {
    light: { backgroundColor: "#ff4d5e" },
    dark: { backgroundColor: "#dc2626" },
  },
  high: {
    light: { backgroundColor: "#ff6b6b" },
    dark: { backgroundColor: "#ef4444" },
  },
  moderate: {
    light: { backgroundColor: "#ffa94d" },
    dark: { backgroundColor: "#f97316" },
  },
  low: {
    light: { backgroundColor: "#4ade80" },
    dark: { backgroundColor: "#10b981" },
  },
  unknown: {
    light: { backgroundColor: "#94a3b8" },
    dark: { backgroundColor: "#64748b" },
  },
};

export const CATEGORY_STYLES = {
  security: {
    light: { backgroundColor: "#8b5cf6" },
    dark: { backgroundColor: "#7c3aed" },
  },
  hardware: {
    light: { backgroundColor: "#ec4899" },
    dark: { backgroundColor: "#db2777" },
  },
  software: {
    light: { backgroundColor: "#3b82f6" },
    dark: { backgroundColor: "#2563eb" },
  },
  infrastructure: {
    light: { backgroundColor: "#10b981" },
    dark: { backgroundColor: "#059669" },
  },
  externalFactor: {
    light: { backgroundColor: "#f59e0b" },
    dark: { backgroundColor: "#d97706" },
  },
  humanError: {
    light: { backgroundColor: "#a855f7" },
    dark: { backgroundColor: "#9333ea" },
  },
  unknown: {
    light: { backgroundColor: "#64748b" },
    dark: { backgroundColor: "#475569" },
  },
};

export const getSeverityStyle = (severity, isDarkMode = false) => {
  if (!severity) return SEVERITY_STYLES.unknown[isDarkMode ? "dark" : "light"];

  const lowerSeverity = severity.toLowerCase();
  const styleObj = SEVERITY_STYLES[lowerSeverity] || SEVERITY_STYLES.unknown;

  return styleObj[isDarkMode ? "dark" : "light"];
};

export const getCategoryStyle = (category, isDarkMode = false) => {
  if (!category) return CATEGORY_STYLES.unknown[isDarkMode ? "dark" : "light"];

  const lowerCategory = category.toLowerCase();
  const styleObj = CATEGORY_STYLES[lowerCategory] || CATEGORY_STYLES.unknown;

  return styleObj[isDarkMode ? "dark" : "light"];
};
