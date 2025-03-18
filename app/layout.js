import "./globals.css";
import { getServerSession } from "./utils/auth/serverAuth";
import Providers from "./contexts/Providers";

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
        <Providers initialUser={user} initialSession={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
