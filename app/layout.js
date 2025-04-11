import "./globals.css";
import { getServerSession } from "./utils/auth/server";
import AppShell from "./contexts/AppShell";
import { VT323, Roboto_Mono, IBM_Plex_Mono } from "next/font/google";

const vt323 = VT323({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});
/**
 * Entry point for the application
 */
const RootLayout = async ({ children }) => {
  const { user, session } = await getServerSession();

  return (
    <html
      lang="en"
      className={`${vt323.className}, ${robotoMono.className}, ${ibmPlexMono.className}`}
    >
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <title>Tech Incidents Archive</title>
      </head>
      <body>
        <AppShell initialUser={user} initialSession={session}>
          {children}
        </AppShell>
      </body>
    </html>
  );
};

export default RootLayout;
