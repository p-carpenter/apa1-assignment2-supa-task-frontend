import React from "react";
import Link from "next/link";
import "./homepage.styles.css";

const Homepage = () => {
  return (
    <div className="archive-container">
      <div className="archive-ornament top-ornament"></div>

      <div className="archive-content">
        <h1 className="archive-title">
          <span className="title-prefix">THE ARCHIVES OF</span>
          TECHNOLOGICAL FAILURES
        </h1>

        <div className="archive-subtitle">YOU MAY EXAMINE THE ARTIFACTS</div>

        <Link href="/gallery" className="archive-entry">
          <span>ENTER</span>
          <span className="arrow">→</span>
        </Link>
      </div>

      <div className="archive-illustrations">
        <div className="illustration-item y2k"></div>
        <div className="illustration-item challenger"></div>
        <div className="illustration-item morris"></div>
        <div className="illustration-item therac"></div>
      </div>

      <div className="archive-ornament bottom-ornament"></div>
    </div>
  );
};

export default Homepage;
