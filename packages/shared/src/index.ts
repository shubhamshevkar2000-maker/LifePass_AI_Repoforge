/**
 * LifePass AI — Shared Types & Contracts Package Baseline
 *
 * PHASE 1: IDENTITY, AUTHENTICATION & CORE DATABASE MODEL
 */

export const LIFEPASS_SHARED_VERSION = "0.1.0";

export type UserRole = "citizen" | "institution_member" | "admin";

export interface Profile {
  id: string; // references auth.users.id
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Institution {
  id: string;
  name: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface InstitutionMember {
  id: string;
  institution_id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string;
}

export interface AuthSessionState {
  userId: string | null;
  phone: string | null;
  isAuthenticated: boolean;
  role: UserRole;
  profile: Profile | null;
  institutionMemberships?: InstitutionMember[];
}

export interface SystemStatus {
  phase: string;
  version: string;
  environment: string;
}

export const GET_INITIAL_SYSTEM_STATUS = (): SystemStatus => ({
  phase: "1.0",
  version: LIFEPASS_SHARED_VERSION,
  environment: "development",
});
