'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import ProfileInfo from '../components/auth/ProfileInfo';
import './profile.styles.css';

// Import reusable components
import { 
  ConsoleWindow, 
  ConsoleSection, 
  CommandOutput, 
  CatalogHeader 
} from '../components/ui';
import { Button } from '../components/ui/buttons';

export default function ProfilePage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Get username from user object, fallback to email if not available
  const username = user?.displayName || user?.email?.split('@')[0] || 'Guest';

  // Define status items for the console footer
  const statusItems = [
    "TECH INCIDENTS ARCHIVE",
    "USER MANAGEMENT",
    { text: user ? `USER: ${username}` : "LOADING USER DATA", blink: !user },
  ];

  if (loading) {
    return (
      <div className="auth-page-container">
        <div className="loading-container">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="circuit-background"></div>
      
      <div className="auth-page-container">
        <ConsoleWindow title="tech-incidents-profile" statusItems={statusItems} className="auth-console">
        <ConsoleSection command="security --profile" commandParts={
                {
                  baseCommand: "security",
                  flags: ["--profile"]
                }
              }>

            <CommandOutput title="USER PROFILE" showGlitch={true} showLoadingBar={true}>
              <div className="output-text">
                  Welcome back to the Tech Incidents Archive.
                </div>
              </CommandOutput>

            <ProfileInfo />
          </ConsoleSection>

        </ConsoleWindow>
      </div>
    </>
  );
}
