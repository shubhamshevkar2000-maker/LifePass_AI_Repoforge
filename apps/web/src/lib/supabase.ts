import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured =
  supabaseUrl !== 'https://placeholder-project.supabase.co' &&
  supabaseAnonKey !== 'placeholder-anon-key' &&
  Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Supabase client instance for Institution Web Portal.
 * Uses browser localStorage for session persistence.
 * NEVER uses or exposes the Supabase service-role key.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
