"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ConditionalNavigation() {
  const pathname = usePathname();
  
  // CRITICAL: Check if we're on admin pages FIRST - if so, DO NOTHING (no redirect, no navigation, no effects)
  // This must be checked BEFORE calling useAuth to prevent unnecessary loading
  const isAdminPage = pathname?.startsWith('/admin');
  
  // If on admin pages, completely skip this component immediately (let admin layout handle everything)
  // This prevents any interference with admin pages and avoids calling useAuth
  if (isAdminPage) {
    return null;
  }
  
  // Only call useAuth if NOT on admin pages
  const { user, isAdmin, loading } = useAuth();
  
  // Hide navigation on auth pages
  const hideNavbar = pathname?.startsWith('/sign-in') || 
                     pathname?.startsWith('/sign-up') ||
                     pathname?.startsWith('/forgot-password') ||
                     pathname?.startsWith('/reset-password');

  // STRICT: If admin tries to access user pages (NOT admin pages), redirect immediately
  useEffect(() => {
    // Double check we're not on admin pages (defensive programming)
    if (pathname?.startsWith('/admin')) {
      return;
    }
    
    // Only redirect if NOT on admin pages and NOT on API routes
    if (!loading && user && isAdmin && !pathname?.startsWith('/api')) {
      window.location.href = "/admin/dashboard";
    }
  }, [user, isAdmin, loading, pathname]);

  if (hideNavbar) {
    return null;
  }

  // Don't show navigation if admin (should redirect anyway)
  if (user && isAdmin) {
    return null;
  }

  return <Navigation />;
}

