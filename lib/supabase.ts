import { createClient } from '@supabase/supabase-js';
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

// Admin Supabase client - uses adminStorage (localStorage_admin)
export const createAdminClient = () => {
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
};

// User Supabase client - uses userStorage (localStorage_user)
export const createUserClient = () => {
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
};

// Client-side Supabase client (for use in components) - defaults to user client
export const createClientComponentClient = () => {
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

