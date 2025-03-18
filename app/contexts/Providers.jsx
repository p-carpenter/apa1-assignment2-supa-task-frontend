"use client";

import { AuthProvider } from "./AuthContext";
import { IncidentProvider } from "./IncidentContext";
import { ThemeProvider } from "./ThemeContext";
import { usePathname } from "next/navigation";
import { Button, CircuitBackground } from "../components/ui";
import buttonStyles from "../components/ui/buttons/Button.module.css";

/**
 * Providers Component
 * Composes all client-side providers and UI shell elements into a single component
 */
export default function Providers({ children, initialUser = null, initialSession = null }) {
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
}
