import React from "react";
import styles from "./Terminal.module.css";

const ConsoleFooter = ({ statusItems = [] }) => {
  if (!statusItems.length) {
    statusItems = [
      "TECH INCIDENTS DATABASE",
      "CATALOG VIEW",
      { text: "0 RECORDS RETRIEVED", blink: true },
    ];
  }

  return (
    <div className={styles.consoleFooter}>
      {statusItems.map((item, index) => {
        // Handle both string and object formats
        if (typeof item === "string") {
          return (
            <div key={index} className={styles.statusItem}>
              {item}
            </div>
          );
        } else {
          return (
            <div
              key={index}
              className={`${styles.statusItem} ${item.blink ? styles.blinkSlow : ""}`}
            >
              {item.text}
            </div>
          );
        }
      })}
    </div>
  );
};

export default ConsoleFooter;
