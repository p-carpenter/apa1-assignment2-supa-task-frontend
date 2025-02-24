

import { WormIcon } from "lucide-react";
import { useState, useEffect } from "react";

export default function Terminal() {
  const [isVisible, setIsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("Worm.c");
  const [fileContents, setFileContents] = useState({});

  const tabs = ["Worm.c", "Worm.h", "Cracksome.c", "Net.c", "Wormdes.c", "Hs.c"];

    useEffect(() => {
    const loadFiles = async () => {
      
      const contents = {};
      try {
        for (const tab of tabs) {
          const response = await fetch(`/artifact_supplements/${tab.toLowerCase()}.txt`);
          contents[tab] = await response.text();
        }
        setFileContents(contents);
      } catch (error) {
        console.error("Error loading files:", error);
      }
    }

    loadFiles();
  }, []);

  return (
    <>
      {isVisible && (
        <div className="artifact">
        <div className="terminal">
          <div className="tabs">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`tab ${activeTab === tab ? "tab-active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                <div className="tab-inner">
                {tab}
              </div>
              </div>
            ))}
          </div>
    <div className="view">View</div>
      <div className="line"></div>
      <div className="code"><div className="info">
        <span>Line 1</span>
        <span>Col 1</span>
        <span className="mobile-hide">Insert Indent Tab Fill Unindent</span>
    <span >C:{activeTab}</span>
    </div>
          <div>
            <pre>{fileContents[activeTab]}</pre>
          </div>
        </div>
        </div>
        </div>
      )}
    </>
  );
}
