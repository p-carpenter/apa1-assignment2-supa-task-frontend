import { formatDate } from "@/app/utils/formatting/dateUtils";
import styles from "./AeroDetailsWindow.module.css";
import { Shield, Cpu, Code, Cloud, Users, Building2, Info } from "lucide-react";

const AeroDetailsWindow = ({ incident }) => {
  if (!incident) return null;

  const getCategoryIcon = (category) => {
    const categoryLower = (category || "").toLowerCase();

    switch (categoryLower) {
      case "security":
        return <Shield size={14} />;
      case "hardware":
        return <Cpu size={14} />;
      case "software":
        return <Code size={14} />;
      case "external factors":
        return <Cloud size={14} />;
      case "human error":
        return <Users size={14} />;
      case "infrastructure":
        return <Building2 size={14} />;
      default:
        return <Info size={14} />;
    }
  };

  const getCategoryIconClass = (category) => {
    const categoryLower = (category || "").toLowerCase();
    let iconClass = `${styles.categoryIcon} `;

    switch (categoryLower) {
      case "security":
        return iconClass + styles.securityIcon;
      case "hardware":
        return iconClass + styles.hardwareIcon;
      case "software":
        return iconClass + styles.softwareIcon;
      case "external factors":
        return iconClass + styles.externalFactorsIcon;
      case "human error":
        return iconClass + styles.humanErrorIcon;
      case "infrastructure":
        return iconClass + styles.infrastructureIcon;
      default:
        return iconClass + styles.defaultIcon;
    }
  };

  return (
    <div className={styles.blurBackground}>
      <div className={styles.windowContainer} data-testid="2000s-window">
        {/* Glass Background */}
        <div className={styles.windowBackground}></div>
        {/* Border layers */}
        <div className={styles.whiteBorder}></div>
        <div className={styles.blackBorder}></div>
        <div className={styles.blueBorder}></div>

        {/* Title Bar with Category-specific Icon */}
        <div className={styles.header}>
          <div className={getCategoryIconClass(incident.category)}>
            {getCategoryIcon(incident.category)}
          </div>
          <h2 className={styles.windowTitle}>
            {incident.name || "Unknown Incident"}
          </h2>
        </div>

        {/* Content area */}
        <div className={styles.contentArea}>
          {/* Metadata row */}
          <div className={styles.metadataRow}>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Date:</span>
              <span>{formatDate(incident.incident_date)}</span>
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
            {/* Description section - Always expanded by default */}
            <div className={styles.contentSection}>
              <div className={styles.sectionText}>{incident.description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AeroDetailsWindow;
