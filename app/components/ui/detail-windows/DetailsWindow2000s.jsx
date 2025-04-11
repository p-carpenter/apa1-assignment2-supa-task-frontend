import { formatDateForDisplay } from "@/app/utils/formatting/dateUtils";
import styles from "./DetailsWindow2000s.module.css";
import { Shield, Cpu, Code, Cloud, Users, Building2, Info } from "lucide-react";

const DetailsWindow2000s = ({ incident }) => {
  if (!incident) return null;

  const CATEGORY_ICONS = {
    security: <Shield size={14} />,
    hardware: <Cpu size={14} />,
    software: <Code size={14} />,
    "external factors": <Cloud size={14} />,
    "human error": <Users size={14} />,
    infrastructure: <Building2 size={14} />,
    unknown: <Info size={14} />,
  };

  const CATEGORY_ICON_CLASSES = {
    security: styles.securityIcon,
    hardware: styles.hardwareIcon,
    software: styles.softwareIcon,
    "external factors": styles.externalFactorsIcon,
    "human error": styles.humanErrorIcon,
    infrastructure: styles.infrastructureIcon,
    unknown: styles.defaultIcon,
  };

  const getCategoryIcon = (category) => {
    if (!category) return CATEGORY_ICONS.unknown;

    const lowerCategory = category.toLowerCase();
    return CATEGORY_ICONS[lowerCategory] || CATEGORY_ICONS.unknown;
  };

  const getCategoryIconClass = (category) => {
    if (!category)
      return `${styles.categoryIcon} ${CATEGORY_ICON_CLASSES.unknown}`;

    const lowerCategory = category.toLowerCase();
    const baseClass = `${styles.categoryIcon} `;

    return (
      baseClass +
      (CATEGORY_ICON_CLASSES[lowerCategory] || CATEGORY_ICON_CLASSES.unknown)
    );
  };

  return (
    <div className={styles.blurBackground}>
      <div className={styles.windowContainer} data-testid="2000s-window">
        <div className={styles.windowBackground}></div>

        <div className={styles.whiteBorder}></div>
        <div className={styles.blackBorder}></div>
        <div className={styles.blueBorder}></div>

        <div className={styles.header}>
          <div
            className={getCategoryIconClass(incident.category)}
            data-testid="category-icon"
          >
            {getCategoryIcon(incident.category)}
          </div>
          <h2 className={styles.windowTitle}>
            {incident.name || "Unknown Incident"}
          </h2>
        </div>

        <div className={styles.contentArea}>
          <div className={styles.metadataRow}>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Date:</span>
              <span data-testid="incident-date">
                {formatDateForDisplay(incident.incident_date)}
              </span>
            </div>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Category:</span>
              <span>{incident.category || "Unknown"}</span>
            </div>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Severity:</span>
              <span className={styles.severityBadge}>
                {incident.severity || "Unknown"}
              </span>
            </div>
          </div>

          {/* content sections */}
          <div className={styles.contentSections}>
            {/* Description section */}
            <div className={styles.contentSection}>
              <div className={styles.sectionText}>
                {incident.description || "No description available."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsWindow2000s;
