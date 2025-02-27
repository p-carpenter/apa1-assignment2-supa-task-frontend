"use client";

import { useState, useEffect, useRef } from "react";
import "./GalleryNavButtons.styles.css";
import "./slide-transitions.css";

const GalleryNavButtons = ({
  onPreviousClick,
  onNextClick,
  incidentYears,
  currentIncidentYear,
  onYearClick,
  onClose,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const previousYearRef = useRef(currentIncidentYear);
  const timelineInnerRef = useRef(null);

  // Calculate the transform value to center the current year
  const calculateTransform = () => {
    if (!incidentYears || incidentYears.length === 0 || !currentIncidentYear) {
      return 0;
    }

    const currentIndex = incidentYears.indexOf(currentIncidentYear);
    // Calculate the position to center the current year
    // Each year button is 50px wide with 10px total margin
    const yearWidth = 60; // 50px + 10px margin

    // Center the current year in the viewport
    // The timeline container shows 5 years, so we need to center the current year
    // in the middle position (position 2 out of 5)
    const centerOffset = 2 * yearWidth;

    const maxTransform = -(incidentYears.length - 5) * yearWidth;

    let translateX = -(currentIndex * yearWidth) + centerOffset;

    // Ensure we don't transform past the first few years
    if (translateX > 0) {
      translateX = 0;
    }

    // Ensure we don't transform past the last few years
    if (translateX < maxTransform) {
      translateX = maxTransform;
    }

    return translateX;
  };

  // Handle animation when current year changes
  useEffect(() => {
    if (
      previousYearRef.current !== currentIncidentYear &&
      incidentYears?.length > 0
    ) {
      setIsAnimating(true);

      // Clear the animation after it completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 350); // Match CSS transition duration

      previousYearRef.current = currentIncidentYear;

      return () => clearTimeout(timer);
    }
  }, [currentIncidentYear, incidentYears]);

  // Handle button click with smooth transition
  const handleYearClick = (year) => {
    if (isAnimating) return; // Prevent clicking during animation
    if (!incidentYears || incidentYears.length === 0) return;

    // Don't animate if clicking the current year
    if (year === currentIncidentYear) return;

    setIsAnimating(true);
    onYearClick(year);
  };

  // Determine the next and previous years for navigation
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

  // Calculate the transform value
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
          >
            {incidentYears && incidentYears.length > 0 ? (
              incidentYears.map((year) => (
                <button
                  key={year}
                  className={`year-button ${year === currentIncidentYear ? "year-button--active" : ""}`}
                  onClick={() => handleYearClick(year)}
                >
                  {year}
                </button>
              ))
            ) : (
              <span className="year-placeholder">No years available</span>
            )}
          </div>
        </div>

        <button className="catalog-button" onClick={onClose}>
          Catalog
        </button>
      </div>

      <div className="gallery-nav-buttons">
        <button
          className="gallery-nav-button gallery-nav-button--prev"
          onClick={() => {
            if (!isAnimating && prevYear) {
              setIsAnimating(true);
              onYearClick(prevYear);
            } else {
              onPreviousClick();
            }
          }}
          aria-label="Previous artifact"
        >
          &#9664;
        </button>

        <button
          className="gallery-nav-button gallery-nav-button--next"
          onClick={() => {
            if (!isAnimating && nextYear) {
              setIsAnimating(true);
              onYearClick(nextYear);
            } else {
              onNextClick();
            }
          }}
          aria-label="Next artifact"
        >
          &#9654;
        </button>
      </div>
    </>
  );
};

export default GalleryNavButtons;
