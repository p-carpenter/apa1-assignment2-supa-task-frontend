"use client";

import { AuthProvider } from "./AuthContext";
import { IncidentProvider } from "./IncidentContext";
import { ThemeProvider } from "./ThemeContext";

const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <IncidentProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </IncidentProvider>
    </AuthProvider>
  );
};

export default Providers;
