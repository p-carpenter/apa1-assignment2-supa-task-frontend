"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { LoginForm } from "@/app/components/forms";
import "./login.styles.css";

// Import reusable components
import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
  CatalogHeader,
} from "../components/ui";
import { Button } from "../components/ui/buttons";

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, loading, router]);

  // Define status items for the console footer
  const statusItems = [
    "TECH INCIDENTS ARCHIVE",
    "USER AUTHENTICATION",
    { text: "AWAITING CREDENTIALS", blink: true },
  ];

  return (
    <>
      <div className="circuit-background"></div>

      <div className="auth-page-container">
        <ConsoleWindow
          title="tech-incidents-login"
          statusItems={statusItems}
          className="auth-console"
        >
          <ConsoleSection
            command="security --auth"
            commandParts={{
              baseCommand: "security",
              flags: ["--auth"],
            }}
          >
            <CommandOutput
              title="USER LOGIN"
              showGlitch={true}
              showLoadingBar={true}
            >
              <div className="output-text">
                Authentication required for secure access.
              </div>
              <div className="output-text highlight">
                PLEASE ENTER YOUR CREDENTIALS
              </div>
            </CommandOutput>

            <LoginForm />
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
}
