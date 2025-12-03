/**
 * Supabase Client Configuration
 * Project: ekalliptus (muyzxygtlwsfegzyvgcm)
 * 
 * This module provides a typed Supabase client for the customer website.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// Environment variable validation
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Custom error for missing Supabase configuration
 */
export class SupabaseConfigError extends Error {
  constructor(missingVar: string) {
    super(`Missing required environment variable: ${missingVar}. Please check your .env file.`);
    this.name = 'SupabaseConfigError';
  }
}

/**
 * Validates that all required environment variables are present
 * @throws {SupabaseConfigError} if any required variable is missing
 */
export function validateSupabaseConfig(): { url: string; anonKey: string } {
  if (!SUPABASE_URL || SUPABASE_URL === '') {
    throw new SupabaseConfigError('VITE_SUPABASE_URL');
  }
  
  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === '') {
    throw new SupabaseConfigError('VITE_SUPABASE_ANON_KEY');
  }
  
  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  };
}

// Supabase configuration
export const SUPABASE_CONFIG = {
  // Auth configuration
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },

  // Database configuration
  db: {
    schema: 'public' as const,
  },

  // Real-time configuration
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
};

// Lazy initialization to allow for testing
let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Get the Supabase client instance
 * Uses lazy initialization to allow for environment variable validation
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    const { url, anonKey } = validateSupabaseConfig();
    
    supabaseInstance = createClient<Database>(url, anonKey, {
      auth: SUPABASE_CONFIG.auth,
      db: SUPABASE_CONFIG.db,
      realtime: SUPABASE_CONFIG.realtime,
    });
  }
  
  return supabaseInstance;
}

/**
 * Create Supabase client instance
 * This is the default export for backward compatibility
 */
export const supabase = (() => {
  try {
    return getSupabaseClient();
  } catch (error) {
    // In development, log the error but don't crash
    // This allows the app to load even if env vars are missing
    console.error('Supabase initialization error:', error);
    
    // Return a placeholder that will throw on use
    return new Proxy({} as SupabaseClient<Database>, {
      get(_, prop) {
        if (prop === 'then') return undefined; // Prevent Promise detection
        throw new SupabaseConfigError('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
      },
    });
  }
})();

/**
 * Reset the Supabase client instance (useful for testing)
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null;
}

/**
 * Type-safe table accessor
 */
export function getTable<T extends keyof Database['public']['Tables']>(tableName: T) {
  return getSupabaseClient().from(tableName);
}

export default supabase;
