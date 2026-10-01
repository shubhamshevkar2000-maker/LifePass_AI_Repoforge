import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Safe client-side Supabase environment configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured =
  supabaseUrl !== 'https://placeholder-project.supabase.co' &&
  supabaseAnonKey !== 'placeholder-anon-key' &&
  Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Supabase client instance configured for React Native / Expo.
 * Uses AsyncStorage for persistent session tokens.
 * NEVER uses or exposes the Supabase service-role key.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
