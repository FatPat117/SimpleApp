import { env } from "../config/env";
import {
    GOOGLE_OAUTH_ACCOUNTS_URL,
    GOOGLE_OAUTH_SCOPE,
    GOOGLE_OAUTH_TOKEN_URL,
    GOOGLE_OAUTH_USERINFO_URL
} from "../constants/auth.constants";
import type { GoogleTokenResponse, GoogleUserInfoResponse } from "../types/auth.types";
import { AppError } from "../utils/AppError";

const ensureGoogleOAuthConfigured = (): void => {
  if (!env.GOOGLE_CLIENT_ID.trim() || !env.GOOGLE_CLIENT_SECRET.trim()) {
    throw new AppError("Google OAuth is not configured", 500, "GOOGLE_OAUTH_NOT_CONFIGURED");
  }
};

export const googleOAuthClient = {
  getAuthorizationUrl(): string {
    ensureGoogleOAuthConfigured();
    const query = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: GOOGLE_OAUTH_SCOPE,
      access_type: "offline",
      prompt: "consent"
    });
    return `${GOOGLE_OAUTH_ACCOUNTS_URL}?${query.toString()}`;
  },

  async exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
    ensureGoogleOAuthConfigured();
    const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code"
      })
    });

    if (!response.ok) {
      throw new AppError("Google OAuth token exchange failed", 401, "GOOGLE_TOKEN_EXCHANGE_FAILED");
    }

    return (await response.json()) as GoogleTokenResponse;
  },

  async fetchUserInfo(accessToken: string): Promise<GoogleUserInfoResponse> {
    const response = await fetch(GOOGLE_OAUTH_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new AppError("Failed to fetch Google user profile", 401, "GOOGLE_PROFILE_FETCH_FAILED");
    }

    const profile = (await response.json()) as GoogleUserInfoResponse;
    if (!profile.email || !profile.sub) {
      throw new AppError("Invalid Google profile response", 401, "GOOGLE_PROFILE_INVALID");
    }

    return profile;
  }
};
