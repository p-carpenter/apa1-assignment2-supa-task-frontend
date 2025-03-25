"use client";

import { useState, useEffect, useRef } from "react";
import Button from "../components/ui/buttons/Button";
import styles from "./GalleryNavButtons.module.css";

/**
 * Navigation component for gallery view with year timeline and next/previous buttons
 * @param {Object} props - The component props
 * @param {Function} props.onPreviousClick - Handler for previous button click
 * @param {Function} props.onNextClick - Handler for next button click
 * @param {Array<number>} props.incidentYears - List of years with incidents
 * @param {number} props.currentIncidentYear - Currently selected year
 * @param {Function} props.onYearClick - Handler for when a year is clicked
 * @param {Object} props.incidentCounts - Object mapping years to number of incidents
 * @param {number} props.currentIncidentIndexInYear - Index of current incident within selected year
 */
const GalleryNavButtons = ({
  onPreviousClick,
  onNextClick,
  incidentYears,
  currentIncidentYear,
  onYearClick,
  incidentCounts = {},
  currentIncidentIndexInYear = 0,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const previousYearRef = useRef(currentIncidentYear);
  const timelineInnerRef = useRef(null);

  /**
   * Calculates the transform value for the timeline to center the current year
   * @returns {number} The translateX value in pixels
   */
  const calculateTransform = () => {
    if (!incidentYears || incidentYears.length === 0 || !currentIncidentYear) {
      return 0;
    }

    const currentIndex = incidentYears.indexOf(currentIncidentYear);
    const yearWidth = 60;
    const centerOffset = 2 * yearWidth;
    const maxTransform = -(incidentYears.length - 5) * yearWidth;

    let translateX = -(currentIndex * yearWidth) + centerOffset;

    if (translateX > 0) {
      translateX = 0;
    }

    if (translateX < maxTransform) {
      translateX = maxTransform;
    }

    return translateX;
  };

  useEffect(() => {
    if (
      previousYearRef.current !== currentIncidentYear &&
      incidentYears?.length > 0
    ) {
      setIsAnimating(true);

      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 350);

      previousYearRef.current = currentIncidentYear;

      return () => clearTimeout(timer);
    }
  }, [currentIncidentYear, incidentYears]);

  /**
   * Handles click on a year button in the timeline
   * @param {number} year - The year that was clicked
   */
  const handleYearClick = (year) => {
    if (isAnimating && year === currentIncidentYear) {
      return;
    }

    setIsAnimating(true);

    if (year !== currentIncidentYear) {
      onYearClick(year, 0);
    } else {
      const nextIndex =
        (currentIncidentIndexInYear + 1) % (incidentCounts[year] || 1);
      onYearClick(year, nextIndex);
    }
  };

  const transformValue = calculateTransform();

  return (
    <>
      <div className={styles.timelineContainer}>
        <div className={styles.timelineInnerContainer}>
          <div
            ref={timelineInnerRef}
            className={styles.timelineInner}
            style={{
              transform: `translateX(${transformValue}px)`,
            }}
            data-testid="timeline-inner"
          >
            {incidentYears && incidentYears.length > 0 ? (
              incidentYears.map((year) => {
                const count = incidentCounts[year] || 0;
                const isCurrentYear = year === currentIncidentYear;

                return (
                  <button
                    key={year}
                    className={`${styles.yearButton} ${isCurrentYear ? `${styles.activeYearButton}` : ""}`}
                    onClick={() => handleYearClick(year)}
                    title={count > 1 ? `${count} incidents in ${year}` : ""}
                  >
                    {year}
                    {count > 1 && (
                      <span className={styles.incidentCount}>
                        {isCurrentYear
                          ? `${currentIncidentIndexInYear + 1}/${count}`
                          : count}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <span className={styles.yearPlaceholder}>No years available</span>
            )}
          </div>
        </div>

        <Button href="/catalog" label="Catalog" icon="" />
      </div>

      <div className={styles.navButtonsContainer}>
        <button
          className={styles.navButton}
          onClick={onPreviousClick}
          aria-label="Previous artifact"
        >
          &#9664;
        </button>

        <button
          className={styles.navButton}
          onClick={onNextClick}
          aria-label="Next artifact"
        >
          &#9654;
        </button>
      </div>
    </>
  );
};

export default GalleryNavButtons;
