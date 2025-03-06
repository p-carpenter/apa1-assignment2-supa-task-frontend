"use client";

import "./globals.css";
import "./styles/components.global.css";
import Providers from "./contexts/Providers";
import { useEffect } from 'react';

export default function RootLayout({ children }) {
  // This effect ensures consistent styles between page navigations
  useEffect(() => {
    // Force a repaint after navigation to fix CSS inconsistencies
    const timer = setTimeout(() => {
      const triggerReflow = document.body.offsetHeight;
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
