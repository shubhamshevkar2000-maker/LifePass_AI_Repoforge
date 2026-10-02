import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAdapter, MockUserSession, RegisterCredentials } from '../services/authAdapter';
import { Institution, InstitutionMember } from '@lifepass/shared';

export interface InstitutionMembershipWithDetails extends InstitutionMember {
  institution?: Institution;
}

export interface InstitutionAuthContextType {
  user: MockUserSession | null;
  session: { user: MockUserSession } | null;
  activeMembership: InstitutionMembershipWithDetails | null;
  allMemberships: InstitutionMembershipWithDetails[];
  isLoading: boolean;
  error: string | null;
  isMemberVerified: boolean;
  login: (username: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  refreshMembership: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const InstitutionAuthContext = createContext<InstitutionAuthContextType | undefined>(undefined);

export const InstitutionAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUserSession | null>(null);
  const [session, setSession] = useState<{ user: MockUserSession } | null>(null);
  const [activeMembership, setActiveMembership] = useState<InstitutionMembershipWithDetails | null>(null);
  const [allMemberships, setAllMemberships] = useState<InstitutionMembershipWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMemberVerified, setIsMemberVerified] = useState<boolean>(false);

  // Derives institution membership from current session
  const buildMembershipFromUser = (currentUser: MockUserSession) => {
    const membership: InstitutionMembershipWithDetails = {
      id: `mem-${currentUser.userId}`,
      institution_id: `inst-${currentUser.userId}`,
      user_id: currentUser.userId,
      role: currentUser.role || 'OFFICER',
      status: 'active',
      created_at: new Date().toISOString(),
      institution: {
        id: `inst-${currentUser.userId}`,
        name: currentUser.institutionName || 'Verified Institution',
        type: currentUser.institutionType || 'bank',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    setActiveMembership(membership);
    setAllMemberships([membership]);
    setIsMemberVerified(true);
  };

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const existing = await authAdapter.getSession();
        if (mounted && existing) {
          setUser(existing);
          setSession({ user: existing });
          buildMembershipFromUser(existing);
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

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (username: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    try {
      const res = await authAdapter.login({ username, password });
      if (!res.success || !res.user) {
        setError(res.error || 'Invalid credentials');
        return { success: false, error: res.error || 'Invalid credentials' };
      }

      setUser(res.user);
      setSession({ user: res.user });
      buildMembershipFromUser(res.user);
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Login failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const signUp = async (data: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    try {
      const res = await authAdapter.register(data);
      if (!res.success || !res.user) {
        setError(res.error || 'Registration failed');
        return { success: false, error: res.error || 'Registration failed' };
      }

      setUser(res.user);
      setSession({ user: res.user });
      buildMembershipFromUser(res.user);
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Registration failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const refreshMembership = async () => {
    if (user) {
      buildMembershipFromUser(user);
    }
  };

  const signOut = async () => {
    try {
      await authAdapter.signOut();
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
