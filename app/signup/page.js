"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { SignupForm } from "@/app/components/forms";
import "./signup.styles.css";

// Import reusable components
import {
  ConsoleWindow,
  ConsoleSection,
  CommandOutput,
  CatalogHeader,
} from "../components/ui";
import { Button } from "../components/ui/buttons";

export default function SignupPage() {
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
    "USER REGISTRATION",
    { text: "NEW ACCOUNT CREATION", blink: true },
  ];

  return (
    <>
      <div className="circuit-background"></div>

      <div className="auth-page-container">
        <ConsoleWindow
          title="tech-incidents-registration"
          statusItems={statusItems}
          className="auth-console"
        >
          <ConsoleSection
            command="security --register"
            commandParts={{
              baseCommand: "security",
              flags: ["--register"],
            }}
          >
            <CommandOutput
              title="JOIN THE ARCHIVE"
              showGlitch={true}
              showLoadingBar={true}
            >
              <div className="output-text">
                Create a new account to become a member of the Archive and
                contribute.
              </div>
            </CommandOutput>

            <SignupForm />
          </ConsoleSection>
        </ConsoleWindow>
      </div>
    </>
  );
}
