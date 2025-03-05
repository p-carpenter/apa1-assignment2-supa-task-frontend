"use client";

import { useState } from "react";
import { useIncidents } from "./contexts/IncidentContext";
import "./homepage.styles.css";

// Import reusable components using barrel files
import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
  CatalogHeader,
  DonationCard,
  MuseumInfo,
  CTAButton,
  Illustrations,
  InfoModal,
} from "./components";

export default function Home() {
  const { incidents } = useIncidents();

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

  // Define status items for the console footer
  const statusItems = [
    "TECH INCIDENTS DATABASE",
    "EXHIBIT #4892",
    { text: "RECORDING VISITOR ACTIVITY", blink: true },
  ];

  return (
    <>
      <div className="circuit-background"></div>
      <div className="archive-container">
        <ConsoleWindow title="tech-incidents-archive" statusItems={statusItems}>
          <div className="console-main-layout">
            <div className="console-left">
              <ConsoleSection command="load tech_incidents.db">
                <CatalogHeader title="TECH INCIDENTS" showGlitch={true} />

                <CommandOutput showLoadingBar={true}>
                  Database loaded successfully.
                </CommandOutput>
              </ConsoleSection>

              <ConsoleSection command="access_level --check">
                <CommandOutput>
                  <div className="output-text blink-once">
                    Verifying credentials...
                  </div>
                  <div className="output-text">Access level: PUBLIC</div>
                  <div className="output-text highlight">
                    YOU MAY EXAMINE THE ARTIFACTS
                  </div>
                </CommandOutput>
              </ConsoleSection>
            </div>

            <div className="console-right">
              <MuseumInfo />

              <DonationCard
                dismissButtonText={dismissButtonText}
                dismissButtonClass={dismissButtonClass}
                onDismissClick={handleDismissClick}
              />
            </div>
          </div>

          <ConsoleSection className="action-section" command="open gallery.exe">
            <CTAButton href="/gallery" text="EXPLORE ARCHIVE" />

            <button
              className="learn-more-link"
              onClick={() => setInfoModalOpen(true)}
            >
              What is the Tech Incidents Archive?
            </button>

            <Illustrations />
          </ConsoleSection>
        </ConsoleWindow>

        {/* About the Tech Incidents Archive Modal */}
        <InfoModal
          isOpen={infoModalOpen}
          onClose={() => setInfoModalOpen(false)}
          title="About the Tech Incidents Archive"
        >
          <p>
            The Tech Incidents Archive is a digital museum dedicated to
            documenting significant technological failures and their impact on
            modern computing safety standards.
          </p>
          <p>
            Our collection features case studies of notable incidents including:
          </p>
          <ul>
            <li>
              Y2K Bug - The millennium bug that threatened to crash computer
              systems worldwide
            </li>
            <li>
              Challenger Disaster - How software and engineering failures led to
              tragedy
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
            By studying these incidents, we can better understand the importance
            of robust software engineering practices.
          </p>
          <div className="modal-buttons">
            <button
              className="modal-button secondary"
              onClick={() => setInfoModalOpen(false)}
            >
              Close
            </button>
          </div>
        </InfoModal>
      </div>
    </>
  );
}
