"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { createAdminClient, createUserClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const pathname = usePathname();
  
  // Determine if we're on admin pages
  const isAdminPage = useMemo(() => {
    return pathname?.startsWith('/admin') ?? false;
  }, [pathname]);
  
  // Use appropriate client based on current page
  // Use useMemo to avoid recreating client on every render
  const supabase = useMemo(() => {
    return isAdminPage ? createAdminClient() : createUserClient();
  }, [isAdminPage]);
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]); // Re-run when client changes (switching between admin/user)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return {
    user,
    profile,
    loading,
    signOut,
    isAdmin: profile?.role === 'admin',
  };
}

