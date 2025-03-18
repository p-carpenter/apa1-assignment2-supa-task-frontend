import "./globals.css";
import { getServerSession } from "./utils/auth/serverAuth";
import AppShell from "./contexts/AppShell";

/**
 * Root Layout
 * Entry point for the application
 */
export default async function RootLayout({ children }) {
  // Fetch authentication data from the server
  const { user, session } = await getServerSession();
  
  return (
    <html lang="en">
      <body>
        <AppShell initialUser={user} initialSession={session}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
