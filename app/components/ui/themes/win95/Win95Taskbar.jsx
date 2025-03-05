import React, { useState, useEffect } from "react";

const Win95Taskbar = ({ activeWindow, decade }) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Update the clock every minute
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedTime = `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}`;
      setCurrentTime(formattedTime);
    };

    updateClock();
    const intervalId = setInterval(updateClock, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="win95-taskbar">
      <div className="win95-start-button">
        <img src="/images/win95-start.png" alt="Start" />
        <span>Start</span>
      </div>

      <div className="win95-taskbar-divider"></div>

      <div className="win95-taskbar-active-programs">
        <div className="win95-taskbar-program-button active">
          <img src="/images/win95-folder-icon.png" alt="File Explorer" />
          <span>Incident Gallery</span>
        </div>
      </div>

      <div className="win95-clock">{currentTime}</div>
    </div>
  );
};

export default Win95Taskbar;
