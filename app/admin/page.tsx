"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to ADMIN sign-in page, not user sign-in
        window.location.href = "/admin/sign-in";
        return;
      } else if (isAdmin) {
        // Admin should go to dashboard
        window.location.href = "/admin/dashboard";
        return;
      } else {
        // Non-admin users should not access admin area
        window.location.href = "/?error=unauthorized";
        return;
      }
    }
  }, [user, isAdmin, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

