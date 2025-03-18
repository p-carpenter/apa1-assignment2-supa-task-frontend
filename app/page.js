"use client";

import { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import styles from "./Homepage.module.css";
import layoutStyles from "./components/layouts/Layout.module.css";
import consoleStyles from "./components/ui/console/Console.module.css";
import terminalStyles from "./components/ui/console/Terminal.module.css";

import { ConsoleWindow, ConsoleSection, CommandOutput } from "./components/ui";
import { CTAButton } from "./components/ui/buttons";
import { MuseumInfo, Illustrations, InfoModal } from "./components/ui/homepage";

export default function Home() {
  const { user } = useAuth();
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const statusItems = [
    "TECH INCIDENTS DATABASE",
    "EXHIBIT #4892",
    { text: "RECORDING VISITOR ACTIVITY", blink: true },
  ];

  return (
    <div className={layoutStyles.archiveContainer}>
      <ConsoleWindow title="tech-incidents-archive" statusItems={statusItems}>
        <div className={consoleStyles.consoleMainLayout}>
          <div className={consoleStyles.consoleLeft}>
            <ConsoleSection
              command="load tech_incidents.db"
              commandParts={{
                baseCommand: "load",
                args: ["tech_incidents.db"],
              }}
            >
              <CommandOutput title="TECH INCIDENTS" showLoadingBar={true}>
                Database loaded successfully.
              </CommandOutput>
            </ConsoleSection>

            <ConsoleSection
              command="access_level --check"
              commandParts={{
                baseCommand: "access_level",
                flags: ["--check"],
              }}
            >
              <CommandOutput>
                <div className={terminalStyles.outputText}>
                  <div>Access level: {user ? "MEMBER" : "PUBLIC"}</div>
                  <div
                    className={`${terminalStyles.outputText} ${terminalStyles.highlight}`}
                  >
                    YOU MAY {user ? "EXAMINE AND CONTRIBUTE TO" : "EXAMINE"} THE
                    ARTIFACTS
                  </div>
                </div>
              </CommandOutput>
            </ConsoleSection>
          </div>

          <div className={consoleStyles.consoleRight}>
            <MuseumInfo />
          </div>
        </div>

        <ConsoleSection
          className={styles.actionSection}
          command="open gallery.exe"
          commandParts={{
            baseCommand: "open",
            args: ["gallery.exe"],
          }}
        >
          <div className={styles.actionButtons}>
            <CTAButton href="/gallery" text="EXPLORE ARCHIVE" />
            <CTAButton href="/catalog" text="CATALOG" />
          </div>

          <button
            className={styles.learnMoreLink}
            onClick={() => setInfoModalOpen(true)}
          >
            What is the Tech Incidents Archive?
          </button>

          <Illustrations />
        </ConsoleSection>
      </ConsoleWindow>

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
            Therac-25 - A radiation therapy machine whose software errors caused
            patient deaths
          </li>
        </ul>
        <p>
          By studying these incidents, we can better understand the importance
          of robust software engineering practices.
        </p>
        <div className={styles.modalButtons}>
          <button
            className={`${styles.modalButton} ${styles.secondary}`}
            onClick={() => setInfoModalOpen(false)}
          >
            Close
          </button>
        </div>
      </InfoModal>
    </div>
  );
}
