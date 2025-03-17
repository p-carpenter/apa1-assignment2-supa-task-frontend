"use client";

import "./globals.css";
import "./styles/components.global.css";
import Providers from "./contexts/Providers";
import { usePathname } from "next/navigation";
import { Button } from "./components";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          {!isHomePage && (
            <div className="floating-home-button">
              <Button href="/" />
            </div>
          )}
        </Providers>
      </body>
    </html>
  );
}
