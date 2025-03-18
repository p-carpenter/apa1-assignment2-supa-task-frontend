"use client";

import "./globals.css";
import Providers from "./contexts/Providers";
import { usePathname } from "next/navigation";
import { Button, CircuitBackground } from "./components/ui";
import buttonStyles from "./components/ui/buttons/Button.module.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <html lang="en">
      <body>
        <Providers>
          <CircuitBackground />
          {children}
          {!isHomePage && (
            <div className={buttonStyles.floatingHomeButton}>
              <Button href="/" />
            </div>
          )}
        </Providers>
      </body>
    </html>
  );
}
