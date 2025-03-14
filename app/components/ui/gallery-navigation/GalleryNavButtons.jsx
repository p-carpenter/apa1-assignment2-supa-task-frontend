"use client";

import { useState, useEffect, useRef } from "react";
import Button from "../buttons/Button";
import "./gallery-variables.css";
import "./GalleryNavButtons.styles.css";
import "./slide-transitions.css";

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

  const getNextPrevYears = () => {
    if (
      !incidentYears ||
      !Array.isArray(incidentYears) ||
      incidentYears.length <= 1
    ) {
      return { nextYear: null, prevYear: null };
    }

    const currentIndex = incidentYears.indexOf(currentIncidentYear);
    if (currentIndex === -1) return { nextYear: null, prevYear: null };

    const nextIndex = (currentIndex + 1) % incidentYears.length;
    const prevIndex =
      (currentIndex - 1 + incidentYears.length) % incidentYears.length;

    return {
      nextYear: incidentYears[nextIndex],
      prevYear: incidentYears[prevIndex],
    };
  };

  const { nextYear, prevYear } = getNextPrevYears();
  const transformValue = calculateTransform();

  return (
    <>
      {/* Timeline container with fixed width and Catalog button side by side */}
      <div className="timeline-container">
        {/* Container for the timeline that slides */}
        <div className="timeline-inner-container">
          {/* Inner timeline that slides left/right */}
          <div
            ref={timelineInnerRef}
            className="timeline-inner"
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
                    className={`year-button ${isCurrentYear ? "year-button--active" : ""}`}
                    onClick={() => handleYearClick(year)}
                    title={count > 1 ? `${count} incidents in ${year}` : ""}
                  >
                    {year}
                    {/* Show indicator for multiple incidents - now using the prop from parent */}
                    {count > 1 && (
                      <span className="incident-count">
                        {isCurrentYear
                          ? `${currentIncidentIndexInYear + 1}/${count}`
                          : count}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <span className="year-placeholder">No years available</span>
            )}
          </div>
        </div>

        <Button href="/catalog" label="Catalog" icon="" />
      </div>

      <div className="gallery-nav-buttons">
        <button
          className="gallery-nav-button"
          onClick={onPreviousClick}
          aria-label="Previous artifact"
        >
          &#9664;
        </button>

        <button
          className="gallery-nav-button"
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
