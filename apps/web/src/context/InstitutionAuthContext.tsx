import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Institution, InstitutionMember } from '@lifepass/shared';

export interface InstitutionMembershipWithDetails extends InstitutionMember {
  institution?: Institution;
}

export interface InstitutionSignUpMetadata {
  institution_name?: string;
  institution_type?: string;
  full_name?: string;
  phone?: string;
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
  isDemoMode: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    metadata?: InstitutionSignUpMetadata
  ) => Promise<{ success: boolean; error?: string }>;
  enableDemoMode: () => void;
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
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

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
        if (mounted && !isDemoMode) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (currentSession?.user) {
            await fetchInstitutionMemberships(currentSession.user.id);
          }
        }
      } catch (err: any) {
        if (mounted && !isDemoMode) {
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
      if (mounted && !isDemoMode) {
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
  }, [isDemoMode]);

  const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    if (!isSupabaseConfigured) {
      const msg = 'Supabase environment not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      setError(msg);
      return { success: false, error: msg };
    }

    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInErr) {
        setError(signInErr.message);
        return { success: false, error: signInErr.message };
      }

      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        await fetchInstitutionMemberships(data.user.id);
        return { success: true };
      }
      return { success: false, error: 'Authentication could not be established.' };
    } catch (err: any) {
      const msg = err?.message || 'Failed to sign in';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    metadata?: InstitutionSignUpMetadata
  ): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    if (!isSupabaseConfigured) {
      const msg = 'Supabase environment not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      setError(msg);
      return { success: false, error: msg };
    }

    try {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: metadata
          ? {
              data: {
                full_name: metadata.full_name,
                phone: metadata.phone,
                institution_name: metadata.institution_name,
                institution_type: metadata.institution_type,
              },
            }
          : undefined,
      });

      if (signUpErr) {
        setError(signUpErr.message);
        return { success: false, error: signUpErr.message };
      }

      // If signUp successful but session is null, email confirmation is likely required.
      if (!data.session && data.user) {
        return { success: true, error: 'Check your email to confirm your account before signing in.' };
      }

      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        await fetchInstitutionMemberships(data.user.id);
        return { success: true };
      }

      return { success: false, error: 'Registration failed unexpectedly.' };
    } catch (err: any) {
      const msg = err?.message || 'Failed to register';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    setUser({ id: 'demo-user-id', email: 'demo@example.com' } as User);
    setSession({ access_token: 'demo-token', user: { id: 'demo-user-id' } } as Session);

    const demoInst = {
      id: 'demo-inst-id',
      name: 'National Education Loan Authority (DEMO)',
      type: 'financial',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const demoMembership = {
      id: 'demo-member-id',
      institution_id: demoInst.id,
      user_id: 'demo-user-id',
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
      institution: demoInst as any
    };

    setActiveMembership(demoMembership);
    setAllMemberships([demoMembership]);
    setIsMemberVerified(true);
    setError(null);
  };

  const refreshMembership = async () => {
    if (user && !isDemoMode) {
      await fetchInstitutionMemberships(user.id);
    }
  };

  const signOut = async () => {
    try {
      if (!isDemoMode) {
        await supabase.auth.signOut();
      }
    } finally {
      setIsDemoMode(false);
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
        isDemoMode,
        signInWithEmail,
        signUpWithEmail,
        enableDemoMode,
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
