import React from "react";
import styles from "./Terminal.module.css";
import loadingStyles from "@/app/components/ui/shared/Loading.module.css";

/**
 * Renders the output section of a console command with optional title and loading indicator
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to display in the output section
 * @param {string} [props.title] - Title to display above the output
 * @param {string} [props.subtitle] - Subtitle to display below the title
 * @param {boolean} [props.showLoadingBar=false] - Whether to show a loading animation
 * @returns {JSX.Element} Command output component
 */
const CommandOutput = ({
  children,
  title,
  subtitle,
  showLoadingBar = false,
}) => {
  return (
    <>
      {renderTitle(title)}
      {renderSubtitle(subtitle)}
      <div className={styles.commandOutput} data-testid="command-output">
        {renderLoadingBar(showLoadingBar)}
        {renderContent(children)}
      </div>
    </>
  );
};

/**
 * Renders the title if provided
 * 
 * @param {string|undefined} title - Title text
 * @returns {JSX.Element|null} Title element or null
 */
function renderTitle(title) {
  if (!title) return null;
  return <h1 className={styles.title}>{title}</h1>;
}

/**
 * Renders the subtitle if provided
 * 
 * @param {string|undefined} subtitle - Subtitle text
 * @returns {JSX.Element|null} Subtitle element or null
 */
function renderSubtitle(subtitle) {
  if (!subtitle) return null;
  return <h2 className={styles.subtitle}>{subtitle}</h2>;
}

/**
 * Renders a loading bar animation if requested
 * 
 * @param {boolean} showLoadingBar - Whether to show the loading bar
 * @returns {JSX.Element|null} Loading bar element or null
 */
function renderLoadingBar(showLoadingBar) {
  if (!showLoadingBar) return null;
  return (
    <div className={loadingStyles.loadingBar}>
      <div className={loadingStyles.loadingProgress}></div>
    </div>
  );
}

/**
 * Renders the content with appropriate formatting
 * 
 * @param {React.ReactNode} content - Content to render
 * @returns {JSX.Element} Formatted content
 */
function renderContent(content) {
  if (typeof content === "string") {
    return <div className={styles.outputText}>{content}</div>;
  }
  return content;
}

export default CommandOutput;
