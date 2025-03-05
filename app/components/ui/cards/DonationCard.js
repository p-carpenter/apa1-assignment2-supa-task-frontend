import React from "react";

const DonationCard = ({
  dismissButtonText,
  dismissButtonClass,
  onDismissClick,
}) => {
  return (
    <div className="console-section wiki-appeal">
      <div className="appeal-heading">
        <span className="appeal-icon">!</span>
        <span>From the Tech Incidents Archive Team</span>
      </div>
      <div className="appeal-text">
        <p>
          <strong>Dear readers,</strong> please forgive this interruption.
        </p>
        <p>
          If the Tech Incidents Archive has helped you learn about disaster
          prevention in the last year, please consider a small donation. It
          costs less than a cup of coffee to maintain this server for a day.
        </p>
        <p>
          98% of our visitors don&rsquo;t donate. But if everyone reading this
          gave $2.75, our funding drive would be done within an hour.
        </p>
        <p>
          <em>— The Tech Incidents Volunteer Team</em>
        </p>
      </div>
      <div className="appeal-buttons">
        <button className="wiki-button donate">Donate Now</button>
        <button
          className={`wiki-button ${dismissButtonClass}`}
          onClick={onDismissClick}
        >
          {dismissButtonText}
        </button>
      </div>
      <div className="appeal-progress">
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
        <div className="progress-text">
          <span className="progress-percent">37%</span> of our $8,000 goal
        </div>
      </div>
    </div>
  );
};

export default DonationCard;
