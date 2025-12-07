import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { adminStorage, userStorage } from './storage';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only throw error in production or if explicitly needed
if (process.env.NODE_ENV === 'production' && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables');
}

// For development, use placeholder values if not set
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey);

// Singleton instances for client-side usage to avoid multiple GoTrueClient instances
let userClientInstance: SupabaseClient | null = null;
let adminClientInstance: SupabaseClient | null = null;

// Admin Supabase client - uses adminStorage (localStorage_admin)
// Returns singleton instance to avoid multiple GoTrueClient instances
export const createAdminClient = (): SupabaseClient => {
  if (typeof window === 'undefined') {
    // Server-side: create new instance
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Missing Supabase environment variables. Please create .env.local file.');
    }
    return createClient(finalUrl, finalKey, {
      auth: {
        storage: adminStorage,
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }

  // Client-side: return singleton instance
  if (!adminClientInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Missing Supabase environment variables. Please create .env.local file.');
    }
    adminClientInstance = createClient(finalUrl, finalKey, {
      auth: {
        storage: adminStorage,
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }
  return adminClientInstance;
};

// User Supabase client - uses userStorage (localStorage_user)
// Returns singleton instance to avoid multiple GoTrueClient instances
export const createUserClient = (): SupabaseClient => {
  if (typeof window === 'undefined') {
    // Server-side: create new instance
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Missing Supabase environment variables. Please create .env.local file.');
    }
    return createClient(finalUrl, finalKey, {
      auth: {
        storage: userStorage,
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }

  // Client-side: return singleton instance
  if (!userClientInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Missing Supabase environment variables. Please create .env.local file.');
    }
    userClientInstance = createClient(finalUrl, finalKey, {
      auth: {
        storage: userStorage,
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }
  return userClientInstance;
};

// Client-side Supabase client (for use in components) - defaults to user client
export const createClientComponentClient = (): SupabaseClient => {
  return createUserClient();
};

// Server-side Supabase client (for use in API routes)
// Uses anon key by default, but can use service role key for admin operations
export const createServerClient = () => {
  // For admin operations, you might want to use service role key
  // This bypasses RLS policies
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (serviceRoleKey) {
    // Use service role key for admin operations (bypasses RLS)
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  
  // Fallback to anon key (respects RLS)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Missing Supabase environment variables. Please create .env.local file.');
  }
  return createClient(finalUrl, finalKey);
};

