"use client";

import { AuthProvider } from "./AuthContext";
import { IncidentProvider } from "./IncidentContext";
import { ThemeProvider } from "./ThemeContext";
import { usePathname } from "next/navigation";
import { Button, CircuitBackground } from "../components/ui";
import buttonStyles from "../components/ui/buttons/Button.module.css";

/**
 * Provides the application shell with global context providers and core UI elements
 * Wraps the entire application with necessary context providers for auth, incidents, and theming
 * Conditionally renders navigation elements based on current route
 *
 * @param {ReactNode} props.children - Application content to wrap with providers and shell UI
 * @param {Object} [props.initialUser=null] - Pre-fetched user data for auth context initialisation
 * @param {Object} [props.initialSession=null] - Pre-fetched session data for auth context initialisation
 */
const AppShell = ({ children, initialUser = null, initialSession = null }) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <AuthProvider initialUser={initialUser} initialSession={initialSession}>
      <IncidentProvider>
        <ThemeProvider>
          <CircuitBackground />
          {children}
          {!isHomePage && (
            <div className={buttonStyles.floatingHomeButton}>
              <Button href="/" />
            </div>
          )}
        </ThemeProvider>
      </IncidentProvider>
    </AuthProvider>
  );
};

export default AppShell;
