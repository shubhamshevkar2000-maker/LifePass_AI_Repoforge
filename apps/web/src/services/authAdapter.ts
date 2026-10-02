/**
 * LifePass AI — Two-Sided Authentication Adapter
 *
 * Architecture Boundary:
 * Isolates the web frontend UI from the underlying authentication provider.
 * CURRENT: MockAuthAdapter (frontend development prototype — zero backend / Supabase dependency).
 * LATER:   SupabaseAuthAdapter (will be connected during final cross-workstream integration).
 */

export type UserType = 'INDIVIDUAL' | 'INSTITUTION';

export interface MockUserSession {
  userId: string;
  username: string;
  fullName: string;
  userType: UserType;
  role: string;
  // Institution fields
  institutionName?: string;
  institutionType?: string;
  // Contact & profile info
  phone?: string;
  email?: string;
  identityType?: string;
}

export interface LoginCredentials {
  username: string;
  password?: string;
  userType?: UserType;
}

export interface RegisterCredentials {
  fullName: string;
  institutionName: string;
  institutionType: string;
  phone: string;
  username: string;
  password?: string;
}

export interface IndividualRegisterCredentials {
  fullName: string;
  username: string;
  password?: string;
  phone?: string;
  email?: string;
  identityType?: string;
}

export interface IAuthAdapter {
  getSession(): Promise<MockUserSession | null>;
  login(credentials: LoginCredentials): Promise<{ success: boolean; user?: MockUserSession; error?: string }>;
  register(credentials: RegisterCredentials): Promise<{ success: boolean; user?: MockUserSession; error?: string }>;
  registerIndividual(credentials: IndividualRegisterCredentials): Promise<{ success: boolean; user?: MockUserSession; error?: string }>;
  signOut(): Promise<void>;
}

const STORAGE_KEY = 'lifepass_mock_session';

export class MockAuthAdapter implements IAuthAdapter {
  async getSession(): Promise<MockUserSession | null> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as MockUserSession;
    } catch {
      return null;
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: MockUserSession; error?: string }> {
    // Brief network latency simulation
    await new Promise((resolve) => setTimeout(resolve, 250));

    const cleanUsername = credentials.username.trim();
    if (!cleanUsername) {
      return { success: false, error: 'Username is required.' };
    }

    if (!credentials.password || credentials.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Check if there is an existing session stored for this username
    let storedSession: MockUserSession | null = null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MockUserSession;
        if (parsed.username.toLowerCase() === cleanUsername.toLowerCase()) {
          storedSession = parsed;
        }
      }
    } catch {
      // fallback
    }

    const targetType: UserType = credentials.userType || storedSession?.userType || 'INSTITUTION';

    // Construct deterministic mock session (NO plaintext passwords stored in state or localStorage)
    let user: MockUserSession;

    if (storedSession) {
      user = storedSession;
    } else if (targetType === 'INDIVIDUAL') {
      user = {
        userId: `user-${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '') || 'demo'}`,
        username: cleanUsername,
        fullName: cleanUsername
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        userType: 'INDIVIDUAL',
        role: 'CITIZEN',
        phone: '+1 555-0182',
        identityType: 'National ID / Passport',
      };
    } else {
      user = {
        userId: `officer-${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '') || 'demo'}`,
        username: cleanUsername,
        fullName: cleanUsername
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        userType: 'INSTITUTION',
        institutionName: 'Apex National Bank',
        institutionType: 'bank',
        phone: '+1 415-555-0199',
        role: 'OFFICER',
      };
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }

    return { success: true, user };
  }

  async register(data: RegisterCredentials): Promise<{ success: boolean; user?: MockUserSession; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const cleanUsername = data.username.trim();
    if (!cleanUsername) {
      return { success: false, error: 'Username is required.' };
    }

    const user: MockUserSession = {
      userId: `officer-${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '') || 'reg'}`,
      username: cleanUsername,
      fullName: data.fullName.trim(),
      userType: 'INSTITUTION',
      institutionName: data.institutionName.trim(),
      institutionType: data.institutionType.trim().toLowerCase(),
      phone: data.phone.trim(),
      role: 'ADMIN_OFFICER',
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }

    return { success: true, user };
  }

  async registerIndividual(data: IndividualRegisterCredentials): Promise<{ success: boolean; user?: MockUserSession; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const cleanUsername = data.username.trim();
    if (!cleanUsername) {
      return { success: false, error: 'Username is required.' };
    }

    const user: MockUserSession = {
      userId: `user-${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '') || 'reg'}`,
      username: cleanUsername,
      fullName: data.fullName.trim(),
      userType: 'INDIVIDUAL',
      role: 'CITIZEN',
      phone: data.phone?.trim() || '+1 555-0100',
      email: data.email?.trim() || `${cleanUsername.toLowerCase()}@example.com`,
      identityType: data.identityType?.trim() || 'Government Issued ID',
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }

    return { success: true, user };
  }

  async signOut(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

// Export default mock adapter instance
export const authAdapter: IAuthAdapter = new MockAuthAdapter();
