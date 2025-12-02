// Custom Storage Adapter for Supabase Auth
// Separates admin and user sessions
// Implements Supabase Storage interface

export class CustomStorage {
  private storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      // Supabase uses keys like: sb-<project-ref>-auth-token
      // We'll store them with our prefix to separate admin and user sessions
      const prefixedKey = `${this.storageKey}_${key}`;
      const item = localStorage.getItem(prefixedKey);
      return item;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const prefixedKey = `${this.storageKey}_${key}`;
      localStorage.setItem(prefixedKey, value);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const prefixedKey = `${this.storageKey}_${key}`;
      localStorage.removeItem(prefixedKey);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  }
}

// Helper to get all keys with prefix (for cleanup)
export const getAllStorageKeys = (storageKey: string): string[] => {
  if (typeof window === 'undefined') return [];
  
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${storageKey}_`)) {
      keys.push(key);
    }
  }
  return keys;
};

// Helper to clear all items with prefix
export const clearStorage = (storageKey: string): void => {
  if (typeof window === 'undefined') return;
  
  const keys = getAllStorageKeys(storageKey);
  keys.forEach(key => localStorage.removeItem(key));
};

// Admin Storage - uses localStorage_admin prefix
export const adminStorage = new CustomStorage('localStorage_admin');

// User Storage - uses localStorage_user prefix
export const userStorage = new CustomStorage('localStorage_user');

