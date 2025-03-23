import React from "react";
import styles from "./Terminal.module.css";
import loadingStyles from "@/app/components/ui/shared/Loading.module.css";

const CommandOutput = ({
  children,
  title,
  subtitle,
  showLoadingBar = false,
}) => {
  return (
    <>
      {title && <h1 className={styles.title}>{title}</h1>}
      {subtitle && <h2 className={styles.subtitle}>{subtitle}</h2>}
      <div className={styles.commandOutput} data-testid="command-output">
        {showLoadingBar && (
          <div className={loadingStyles.loadingBar}>
            <div className={loadingStyles.loadingProgress}></div>
          </div>
        )}
        {typeof children === "string" ? (
          <div className={styles.outputText}>{children}</div>
        ) : (
          children
        )}
      </div>
    </>
  );
};

export default CommandOutput;
