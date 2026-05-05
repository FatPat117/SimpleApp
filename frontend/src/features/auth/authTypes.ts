import type { UserProfile } from "../user/userTypes";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  requiresPasswordChange: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  accessTokenExpiresAt: number | null;
  user: AuthUser | null;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface SignUpPayload {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  message: string;
  expiresIn: number;
  user: UserProfile;
}
