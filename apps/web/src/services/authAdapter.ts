/**
 * LifePass AI — Institution Web Portal Auth Adapter
 *
 * Architecture Boundary:
 * This module isolates the frontend UI from the underlying authentication provider.
 * CURRENT: MockAuthAdapter (frontend development prototype — zero backend / Supabase dependency).
 * LATER:   SupabaseAuthAdapter (will be connected during final cross-workstream integration).
 */

export interface MockUserSession {
  userId: string;
  username: string;
  fullName: string;
  institutionName: string;
  institutionType: string;
  phone: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password?: string;
}

export interface RegisterCredentials {
  fullName: string;
  institutionName: string;
  institutionType: string;
  phone: string;
  username: string;
  password?: string;
}

export interface IAuthAdapter {
  getSession(): Promise<MockUserSession | null>;
  login(credentials: LoginCredentials): Promise<{ success: boolean; user?: MockUserSession; error?: string }>;
  register(credentials: RegisterCredentials): Promise<{ success: boolean; user?: MockUserSession; error?: string }>;
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
    // Simulate brief network feedback
    await new Promise((resolve) => setTimeout(resolve, 250));

    const cleanUsername = credentials.username.trim();
    if (!cleanUsername) {
      return { success: false, error: 'Username is required.' };
    }

    if (!credentials.password || credentials.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Check if there is an existing session stored for this user
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

    // Construct deterministic mock session (NO passwords stored in state or localStorage)
    const user: MockUserSession = storedSession || {
      userId: `officer-${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '') || 'demo'}`,
      username: cleanUsername,
      fullName: cleanUsername
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      institutionName: 'Apex National Bank',
      institutionType: 'bank',
      phone: '+1 415-555-0199',
      role: 'OFFICER',
    };

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
      institutionName: data.institutionName.trim(),
      institutionType: data.institutionType.trim().toLowerCase(),
      phone: data.phone.trim(),
      role: 'ADMIN_OFFICER',
    };

    try {
      // Store session marker and non-sensitive display info ONLY (NO passwords!)
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
