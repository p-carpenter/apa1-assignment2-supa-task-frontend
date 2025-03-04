import React, { useState } from "react";
import Link from "next/link";
import "./homepage.styles.css";

const Homepage = () => {
  // States for modals and button text
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [dismissButtonText, setDismissButtonText] = useState("Maybe Later");
  const [dismissButtonClass, setDismissButtonClass] = useState("dismiss");

  // Handle the donation button transformation
  const handleDismissClick = () => {
    if (dismissButtonText === "Maybe Later") {
      setDismissButtonText("Donate £100");
      setDismissButtonClass("donate big-donate");
    }
  };

  return (
    <>
      {/* Subtle background texture */}
      <div className="circuit-background"></div>
      <div className="archive-container">
        <div className="console-window">
          <div className="terminal-header">
            <span className="terminal-dot"></span>
            <span className="terminal-dot"></span>
            <span className="terminal-dot"></span>
            <div className="terminal-title">tech-incidents-archive</div>
            <div className="auth-controls">
              <button className="auth-button login">Log In</button>
              <button className="auth-button signup">Sign Up</button>
            </div>
          </div>

          <div className="console-content">
            <div className="console-main-layout">
              <div className="console-left">
                <div className="console-section">
                  <div className="command-line">
                    <span className="prompt">user@archive:~$</span>
                    <span className="command">load tech_incidents.db</span>
                  </div>

                  <h1 className="archive-title">
                    <span className="title-glitch" data-text="TECH INCIDENTS">
                      TECH INCIDENTS
                    </span>
                    <span className="cursor"></span>
                  </h1>

                  <div className="command-output">
                    <div className="loading-bar">
                      <div className="loading-progress"></div>
                    </div>
                    <div className="output-text">
                      Database loaded successfully.
                    </div>
                  </div>
                </div>

                <div className="console-section">
                  <div className="command-line">
                    <span className="prompt">user@archive:~$</span>
                    <span className="command">access_level --check</span>
                  </div>

                  <div className="command-output">
                    <div className="output-text blink-once">
                      Verifying credentials...
                    </div>
                    <div className="output-text">Access level: PUBLIC</div>
                    <div className="output-text highlight">
                      YOU MAY EXAMINE THE ARTIFACTS
                    </div>
                  </div>
                </div>
              </div>

              <div className="console-right">
                <div className="console-section museum-info">
                  <div className="museum-header">INCIDENT ARCHIVE</div>
                  <div className="museum-description">
                    This historical collection documents significant
                    technological failures that have shaped computing safety
                    protocols and standards. Each case study represents lessons
                    learned through technological crisis.
                  </div>
                  <div className="contribution-note">
                    <strong>Contribute to the Archive:</strong> Registered
                    members can submit and edit documentation for technical
                    incidents.
                  </div>
                </div>
                <div className="console-section wiki-appeal">
                  <div className="appeal-heading">
                    <span className="appeal-icon">!</span>
                    <span>From the Tech Incidents Archive Team</span>
                  </div>
                  <div className="appeal-text">
                    <p>
                      <strong>Dear readers,</strong> please forgive this
                      interruption.
                    </p>
                    <p>
                      If the Tech Incidents Archive has helped you learn about
                      disaster prevention in the last year, please consider a
                      small donation. It costs less than a cup of coffee to
                      maintain this server for a day.
                    </p>
                    <p>
                      98% of our visitors don't donate. But if everyone reading
                      this gave $2.75, our funding drive would be done within an
                      hour.
                    </p>
                    <p>
                      <em>— The Tech Incidents Volunteer Team</em>
                    </p>
                  </div>
                  <div className="appeal-buttons">
                    <button className="wiki-button donate">Donate Now</button>
                    <button
                      className={`wiki-button ${dismissButtonClass}`}
                      onClick={handleDismissClick}
                    >
                      {dismissButtonText}
                    </button>
                  </div>
                  <div className="appeal-progress">
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                    <div className="progress-text">
                      <span className="progress-percent">37%</span> of our
                      $8,000 goal
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="console-section action-section">
              <div className="command-line">
                <span className="prompt">user@archive:~$</span>
                <span className="command">open gallery.exe</span>
                <span className="cursor command-cursor"></span>
              </div>

              <Link href="/gallery" className="console-button">
                <div className="button-glow"></div>
                <span className="button-text">EXPLORE ARCHIVE</span>
                <span className="entry-icon">&#x2192;</span>
              </Link>

              <button
                className="learn-more-link"
                onClick={() => setInfoModalOpen(true)}
              >
                What is the Tech Incidents Archive?
              </button>

              <div className="console-illustrations">
                <div
                  className="illustration-item y2k"
                  data-tooltip="Y2K Bug (2000)"
                ></div>
                <div
                  className="illustration-item challenger"
                  data-tooltip="Challenger Disaster (1986)"
                ></div>
                <div
                  className="illustration-item morris"
                  data-tooltip="Morris Worm (1988)"
                ></div>
                <div
                  className="illustration-item therac"
                  data-tooltip="Therac-25 (1985-87)"
                ></div>
              </div>
            </div>
          </div>

          <div className="console-footer">
            <div className="status-item">TECH INCIDENTS DATABASE</div>
            <div className="status-item">EXHIBIT #4892</div>
            <div className="status-item blink-slow">
              RECORDING VISITOR ACTIVITY
            </div>
          </div>
        </div>

        {/* Simplified info modal */}
        {infoModalOpen && (
          <div className="info-overlay" onClick={() => setInfoModalOpen(false)}>
            <div className="info-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="close-modal"
                onClick={() => setInfoModalOpen(false)}
              >
                ×
              </button>
              <h2>About the Tech Incidents Archive</h2>
              <p>
                The Tech Incidents Archive is a digital museum dedicated to
                documenting significant technological failures and their impact
                on modern computing safety standards.
              </p>
              <p>
                Our collection features case studies of notable incidents
                including:
              </p>
              <ul>
                <li>
                  Y2K Bug - The millennium bug that threatened to crash computer
                  systems worldwide
                </li>
                <li>
                  Challenger Disaster - How software and engineering failures
                  led to tragedy
                </li>
                <li>
                  Morris Worm - One of the first recognized computer worms that
                  affected the internet
                </li>
                <li>
                  Therac-25 - A radiation therapy machine whose software errors
                  caused patient deaths
                </li>
              </ul>
              <p>
                By studying these incidents, we can better understand the
                importance of robust software engineering practices.
              </p>
              <div className="modal-buttons">
                <button
                  className="modal-button secondary"
                  onClick={() => setInfoModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Homepage;
