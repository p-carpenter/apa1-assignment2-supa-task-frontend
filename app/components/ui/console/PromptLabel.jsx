import React from "react";
import terminalStyles from "@/app/components/ui/console/Terminal.module.css";

const PromptLabel = ({ children }) => {
  return (
    <>
      <span className={terminalStyles.prompt}>$</span> {children}
    </>
  );
};

export default PromptLabel;
