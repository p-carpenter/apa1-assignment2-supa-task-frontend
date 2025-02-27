import React from "react";
import "./GalleryNavButtons.styles.css";

const GalleryNavButtons = ({ onPreviousClick, onNextClick }) => {
  return (
    <div className="gallery-nav-buttons">
      <button
        className="gallery-nav-button gallery-nav-button--prev"
        onClick={onPreviousClick}
        aria-label="Previous artifact"
      >
        &#9664;
      </button>

      <button
        className="gallery-nav-button gallery-nav-button--next"
        onClick={onNextClick}
        aria-label="Next artifact"
      >
        &#9654;
      </button>
    </div>
  );
};

export default GalleryNavButtons;
