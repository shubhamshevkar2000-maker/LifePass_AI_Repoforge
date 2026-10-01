import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '@lifepass/shared';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
  phoneEntered: string;
  setPhoneEntered: (phone: string) => void;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; error?: string }>;
  updateProfileName: (fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneEntered, setPhoneEntered] = useState<string>('');

  // Fetch application profile from public.profiles
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr) {
        // If profile doesn't exist yet, attempt to insert it for the authenticated user
        if (profileErr.code === 'PGRST116') {
          const { data: newProfile, error: insertErr } = await supabase
            .from('profiles')
            .insert({ id: userId, full_name: '', phone: phoneEntered || null })
            .select()
            .single();

          if (!insertErr && newProfile) {
            setProfile(newProfile as Profile);
          }
        }
      } else if (data) {
        setProfile(data as Profile);
      }
    } catch {
      // Non-blocking for auth state
    }
  };

  // Restore existing session on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await fetchProfile(initialSession.user.id);
          }
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || 'Failed to restore session');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Request Phone Number OTP through Supabase Auth
  const sendOtp = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    if (!isSupabaseConfigured) {
      const msg = 'Supabase environment is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.';
      setError(msg);
      return { success: false, error: msg };
    }

    try {
      const formattedPhone = phone.trim().startsWith('+') ? phone.trim() : `+${phone.trim()}`;
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: 'sms',
        },
      });

      if (otpErr) {
        setError(otpErr.message);
        return { success: false, error: otpErr.message };
      }

      setPhoneEntered(formattedPhone);
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Failed to request OTP';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Verify received OTP code through Supabase Auth
  const verifyOtp = async (phone: string, token: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    if (!isSupabaseConfigured) {
      const msg = 'Supabase environment is not configured.';
      setError(msg);
      return { success: false, error: msg };
    }

    try {
      const formattedPhone = phone.trim().startsWith('+') ? phone.trim() : `+${phone.trim()}`;
      const { data, error: verifyErr } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: token.trim(),
        type: 'sms',
      });

      if (verifyErr) {
        setError(verifyErr.message);
        return { success: false, error: verifyErr.message };
      }

      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        await fetchProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: 'Authentication could not be established.' };
    } catch (err: any) {
      const msg = err?.message || 'Invalid or expired verification code';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Update profile full_name
  const updateProfileName = async (fullName: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const { data, error: updateErr } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', user.id)
        .select()
        .single();

      if (updateErr) {
        return { success: false, error: updateErr.message };
      }
      if (data) {
        setProfile(data as Profile);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Profile update failed' };
    }
  };

  // Sign out and clear session
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setError(null);
      setPhoneEntered('');
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured: isSupabaseConfigured,
        error,
        phoneEntered,
        setPhoneEntered,
        sendOtp,
        verifyOtp,
        updateProfileName,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
