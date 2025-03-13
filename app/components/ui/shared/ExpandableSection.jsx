import React, { useState, useRef, useEffect } from 'react';
import styles from './ExpandableSection.module.css';

/**
 * A reusable component for expandable/collapsible content sections
 * that maintains the parent component's styling
 */
const ExpandableSection = ({ 
  title, 
  children, 
  titleClassName, 
  contentClassName,
  sectionClassName,
  expandedByDefault = false,
  maxLines = 2,
  minLinesForExpansion = 3
}) => {
  const [expanded, setExpanded] = useState(expandedByDefault);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      // Get the computed line height for accurate calculation
      const lineHeight = parseInt(window.getComputedStyle(contentRef.current).lineHeight) || 20;
      const contentHeight = contentRef.current.scrollHeight;
      const estimatedLines = Math.ceil(contentHeight / lineHeight);
      
      setNeedsExpansion(estimatedLines > minLinesForExpansion);
    }
  }, [children, minLinesForExpansion]);

  const toggleExpanded = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div className={`${styles.section} ${sectionClassName || ''}`}>
      {/* Title */}
      <div className={`${styles.sectionTitle} ${titleClassName || ''}`}>
        <div>{title}</div>
      </div>
      
      {/* Content area */}
      <div className={styles.sectionContentWrapper}>
        <div 
          ref={contentRef}
          className={`
            ${styles.sectionContent} 
            ${contentClassName || ''} 
            ${expanded ? styles.expanded : needsExpansion ? styles.collapsed : ''}
          `}
          style={!expanded && needsExpansion ? { WebkitLineClamp: maxLines } : {}}
        >
          {children}
        </div>
        
        {needsExpansion && (
          <div 
            className={styles.readMoreButton} 
            onClick={toggleExpanded}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandableSection;
