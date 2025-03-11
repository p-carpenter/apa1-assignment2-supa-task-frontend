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
    if (isAnimating) return; 
    if (!incidentYears || incidentYears.length === 0) return;

    
    if (year === currentIncidentYear) return;

    setIsAnimating(true);
    onYearClick(year);
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

        <Button href="/catalog" label="Catalog" icon="" />
      </div>

      <div className="gallery-nav-buttons">
        <button
          className="gallery-nav-button"
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
          className="gallery-nav-button"
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
