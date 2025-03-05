import { useState, useEffect } from "react";
import "./MorrisWorm.css";

const MorrisWorm = () => {
  const [activeTab, setActiveTab] = useState("Worm.c");
  const [fileContents, setFileContents] = useState({});

  const tabs = [
    "Worm.c",
    "Worm.h",
    "Cracksome.c",
    "Net.c",
    "Wormdes.c",
    "Hs.c",
  ];

  useEffect(() => {
    const loadFiles = async () => {
      const contents = {};
      try {
        for (const tab of tabs) {
          const response = await fetch(
            `/artifact_supplements/${tab.toLowerCase()}.txt`
          );
          contents[tab] = await response.text();
        }
        setFileContents(contents);
      } catch (error) {
        console.error("Error loading files:", error);
      }
    };

    loadFiles();
  }, []);

  return (
    <div className="terminal">
      <div className="terminal-wrapper">
        <div className="morris-worm-container">
          <div className="tabs">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`tab ${activeTab === tab ? "tab-active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                <div className="tab-inner">{tab}</div>
              </div>
            ))}
          </div>
          <div className="view">View</div>
          <div className="line"></div>
          <div className="code">
            <div className="info">
              <span>Line 1</span>
              <span>Col 1</span>
              <span className="mobile-hide">
                Insert Indent Tab Fill Unindent
              </span>
              <span>C:{activeTab}</span>
            </div>
            <div style={{ height: "calc(100% - 40px)", overflow: "auto" }}>
              <pre>{fileContents[activeTab] || "Loading..."}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MorrisWorm;
