import React from 'react';
import TerminalHeader from './TerminalHeader';
import ConsoleFooter from './ConsoleFooter';

const ConsoleWindow = ({ children, title, statusItems }) => {
  return (
    <div className="console-window">
      <TerminalHeader title={title} />
      <div className="console-content">
        {children}
      </div>
      <ConsoleFooter statusItems={statusItems} />
    </div>
  );
};

export default ConsoleWindow;
