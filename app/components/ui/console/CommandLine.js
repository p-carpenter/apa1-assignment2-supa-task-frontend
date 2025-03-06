"use client";

import React from "react";
import { useAuth } from '../../../contexts/AuthContext';

const CommandLine = ({ command }) => {
  const { user } = useAuth();
  const username = user?.displayName || user?.email?.split('@')[0] || 'guest';
  return (
    <div className="command-line">
      <span className="prompt">{username}@archive:~$</span>
      <span className="command">{command}</span>
    </div>
  );
};

export default CommandLine;
