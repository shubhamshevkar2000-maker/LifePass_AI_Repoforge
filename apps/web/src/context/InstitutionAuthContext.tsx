import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Institution, InstitutionMember } from '@lifepass/shared';

export interface InstitutionMembershipWithDetails extends InstitutionMember {
  institution?: Institution;
}

export interface InstitutionSignUpData {
  fullName: string;
  institutionName: string;
  institutionType: string;
  phone: string;
  username: string;
  password: string;
}

export interface InstitutionAuthContextType {
  user: User | null;
  session: Session | null;
  activeMembership: InstitutionMembershipWithDetails | null;
  allMemberships: InstitutionMembershipWithDetails[];
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
  isMemberVerified: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: InstitutionSignUpData) => Promise<{ success: boolean; error?: string }>;
  refreshMembership: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const InstitutionAuthContext = createContext<InstitutionAuthContextType | undefined>(undefined);

export const InstitutionAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [activeMembership, setActiveMembership] = useState<InstitutionMembershipWithDetails | null>(null);
  const [allMemberships, setAllMemberships] = useState<InstitutionMembershipWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMemberVerified, setIsMemberVerified] = useState<boolean>(false);

  // Fetch institution memberships strictly from database (enforced by RLS)
  const fetchInstitutionMemberships = async (userId: string) => {
    try {
      const { data: memberRows, error: memberErr } = await supabase
        .from('institution_members')
        .select('id, institution_id, user_id, role, status, created_at')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (memberErr) {
        setIsMemberVerified(false);
        setActiveMembership(null);
        setAllMemberships([]);
        return;
      }

      if (memberRows && memberRows.length > 0) {
        // Fetch institution names for each membership
        const institutionIds = memberRows.map((m: any) => m.institution_id);
        const { data: instRows } = await supabase
          .from('institutions')
          .select('id, name, type, status, created_at, updated_at')
          .in('id', institutionIds);

        const instMap = new Map((instRows || []).map((i: any) => [i.id, i]));
        const enriched: InstitutionMembershipWithDetails[] = memberRows.map((m: any) => ({
          ...m,
          institution: instMap.get(m.institution_id),
        }));

        setAllMemberships(enriched);
        setActiveMembership(enriched[0]);
        setIsMemberVerified(true);
      } else {
        setAllMemberships([]);
        setActiveMembership(null);
        setIsMemberVerified(false);
      }
    } catch {
      setIsMemberVerified(false);
      setActiveMembership(null);
      setAllMemberships([]);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (currentSession?.user) {
            await fetchInstitutionMemberships(currentSession.user.id);
          }
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || 'Failed to initialize session');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchInstitutionMemberships(newSession.user.id);
        } else {
          setActiveMembership(null);
          setAllMemberships([]);
          setIsMemberVerified(false);
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    if (!isSupabaseConfigured) {
      const msg = 'Supabase environment not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      setError(msg);
      return { success: false, error: msg };
    }

    try {
      const cleanUsername = username.trim().toLowerCase();
      // Supabase GoTrue internally maps identity to email or phone.
      // We map username to an internal pseudo-domain to provide a zero-email, zero-OTP user experience.
      const internalEmail = `${cleanUsername}@institution.lifepass.internal`;

      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: internalEmail,
        password,
      });

      if (authErr) {
        const errorMsg =
          authErr.message === 'Invalid login credentials'
            ? 'Invalid username or password.'
            : authErr.message;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        await fetchInstitutionMemberships(data.user.id);
        return { success: true };
      }
      return { success: false, error: 'Authentication could not be established.' };
    } catch (err: any) {
      const msg = err?.message || 'Login failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const signUp = async (data: InstitutionSignUpData): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    if (!isSupabaseConfigured) {
      const msg = 'Supabase environment not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      setError(msg);
      return { success: false, error: msg };
    }

    try {
      const cleanUsername = data.username.trim().toLowerCase();
      const internalEmail = `${cleanUsername}@institution.lifepass.internal`;
      const formattedPhone = data.phone.trim().startsWith('+') ? data.phone.trim() : `+${data.phone.trim()}`;

      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: internalEmail,
        password: data.password,
        options: {
          data: {
            username: cleanUsername,
            full_name: data.fullName.trim(),
            institution_name: data.institutionName.trim(),
            institution_type: data.institutionType.trim().toLowerCase(),
            phone: formattedPhone,
          },
        },
      });

      if (authErr) {
        setError(authErr.message);
        return { success: false, error: authErr.message };
      }

      if (authData.session && authData.user) {
        setSession(authData.session);
        setUser(authData.user);
        await fetchInstitutionMemberships(authData.user.id);
        return { success: true };
      } else if (authData.user && !authData.session) {
        return {
          success: true,
          error: 'Registration submitted! Please sign in with your credentials.',
        };
      }

      return { success: false, error: 'Registration failed to initialize session.' };
    } catch (err: any) {
      const msg = err?.message || 'Registration failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const refreshMembership = async () => {
    if (user) {
      await fetchInstitutionMemberships(user.id);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setActiveMembership(null);
      setAllMemberships([]);
      setIsMemberVerified(false);
      setError(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <InstitutionAuthContext.Provider
      value={{
        user,
        session,
        activeMembership,
        allMemberships,
        isLoading,
        isConfigured: isSupabaseConfigured,
        error,
        isMemberVerified,
        login,
        signUp,
        refreshMembership,
        signOut,
        clearError,
      }}
    >
      {children}
    </InstitutionAuthContext.Provider>
  );
};

export const useInstitutionAuth = (): InstitutionAuthContextType => {
  const context = useContext(InstitutionAuthContext);
  if (!context) {
    throw new Error('useInstitutionAuth must be used within an InstitutionAuthProvider');
  }
  return context;
};
