"use client";

import "./globals.css";
import "./styles/components.global.css";
import Providers from "./contexts/Providers";
import { useEffect } from "react";
import { Button } from "./components";

export default function RootLayout({ children }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const triggerReflow = document.body.offsetHeight;
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <div className="floating-home-button">
            <Button href="/" />
          </div>
        </Providers>
      </body>
    </html>
  );
}
