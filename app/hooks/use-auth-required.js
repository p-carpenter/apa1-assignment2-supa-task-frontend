"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/contexts/auth-context";

/**
 * Hook to require authentication for a page
 * Redirects to login page if user is not authenticated
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.redirectTo - Path to redirect to if not authenticated
 * @returns {Object} Auth context
 */
export function useAuthRequired({
  redirectTo = "/login",
} = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();

  useEffect(() => {
    // If still loading, wait for completion
    if (auth.isLoading) return;
    
    // If not authenticated, redirect to login
    if (!auth.isAuthenticated) {
      router.push(`${redirectTo}?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [auth.isAuthenticated, auth.isLoading, router, pathname, redirectTo]);

  return auth;
}
