"use client";

import { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import styles from "./Homepage.module.css";
import layoutStyles from "./components/layouts/Layout.module.css";
import consoleStyles from "./components/ui/console/Console.module.css";
import terminalStyles from "./components/ui/console/Terminal.module.css";

import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
} from "./components/ui/console";
import { CTAButton } from "./components/ui/buttons";
import { MuseumInfo, Illustrations, InfoModal } from "./components/ui/homepage";

/**
 * Landing page that introduces users to the Tech Incidents Archive
 */
const Home = () => {
  const { user } = useAuth();

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

          <Illustrations />
        </ConsoleSection>
      </ConsoleWindow>
    </div>
  );
};

export default Home;
