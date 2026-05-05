import bcrypt from "bcrypt";
import { env } from "../config/env";
import { User } from "../models/user.model";
import { authService } from "../services/auth.service";
import { mailService } from "../services/mail.service";
import { tokenService } from "../services/token.service";

const originalFetch = global.fetch;

describe("Auth service", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it("signup creates unverified user and sends verification email", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const createdUser = {
      id: "u-1",
      username: "tester",
      email: "tester@example.com",
      emailVerificationToken: null,
      save: saveMock
    } as unknown as User;

    jest.spyOn(User, "findOne").mockResolvedValue(null);
    jest.spyOn(User, "create").mockResolvedValue(createdUser);
    jest.spyOn(tokenService, "signEmailVerificationToken").mockReturnValue("verify-token");
    const sendEmailSpy = jest.spyOn(mailService, "sendVerificationEmail").mockResolvedValue(undefined);

    await authService.signup({
      username: "tester",
      email: "tester@example.com",
      password: "Password@123"
    });

    expect(User.findOne).toHaveBeenCalled();
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "tester",
        email: "tester@example.com",
        isEmailVerified: false
      })
    );
    expect(createdUser.emailVerificationToken).toBe("verify-token");
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(sendEmailSpy).toHaveBeenCalledWith("tester@example.com", "verify-token");
  });

  it("signup fails when username or email already exists", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue({ id: "u-2" } as User);

    await expect(
      authService.signup({
        username: "tester",
        email: "tester@example.com",
        password: "Password@123"
      })
    ).rejects.toMatchObject({
      message: "Email or username already in use",
      statusCode: 409
    });
  });

  it("verifyEmail marks account as verified when token is valid", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const existingUser = {
      id: "u-1",
      emailVerificationToken: "verify-token",
      isEmailVerified: false,
      save: saveMock
    } as unknown as User;

    jest.spyOn(tokenService, "verifyEmailVerificationToken").mockReturnValue({
      sub: "u-1",
      email: "tester@example.com",
      username: "tester",
      purpose: "email-verification"
    });
    jest.spyOn(User, "findByPk").mockResolvedValue(existingUser);

    await authService.verifyEmail("verify-token");

    expect(existingUser.isEmailVerified).toBe(true);
    expect(existingUser.emailVerificationToken).toBeNull();
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it("verifyEmail fails when token does not match stored value", async () => {
    const existingUser = {
      id: "u-1",
      emailVerificationToken: "another-token",
      isEmailVerified: false,
      save: jest.fn()
    } as unknown as User;

    jest.spyOn(tokenService, "verifyEmailVerificationToken").mockReturnValue({
      sub: "u-1",
      email: "tester@example.com",
      username: "tester",
      purpose: "email-verification"
    });
    jest.spyOn(User, "findByPk").mockResolvedValue(existingUser);

    await expect(authService.verifyEmail("verify-token")).rejects.toMatchObject({
      message: "Invalid verification token",
      statusCode: 400
    });
  });

  it("login fails when email is not verified", async () => {
    const passwordHash = await bcrypt.hash("Password@123", 8);
    const existingUser = {
      id: "u-3",
      username: "tester",
      email: "tester@example.com",
      passwordHash,
      isEmailVerified: false,
      requiresPasswordChange: false,
      save: jest.fn()
    } as unknown as User;

    jest.spyOn(User, "findOne").mockResolvedValue(existingUser);

    await expect(
      authService.login({
        identifier: "tester@example.com",
        password: "Password@123"
      })
    ).rejects.toMatchObject({
      message: "Email not verified",
      statusCode: 403
    });
  });

  it("login fails when password is wrong", async () => {
    const passwordHash = await bcrypt.hash("Password@123", 8);
    const existingUser = {
      id: "u-4",
      username: "tester",
      email: "tester@example.com",
      passwordHash,
      isEmailVerified: true,
      requiresPasswordChange: false,
      save: jest.fn()
    } as unknown as User;

    jest.spyOn(User, "findOne").mockResolvedValue(existingUser);

    await expect(
      authService.login({
        identifier: "tester@example.com",
        password: "WrongPassword@123"
      })
    ).rejects.toMatchObject({
      message: "Invalid credentials",
      statusCode: 401
    });
  });

  it("login succeeds and rotates refresh hash on user", async () => {
    const passwordHash = await bcrypt.hash("Password@123", 8);
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const existingUser = {
      id: "u-5",
      username: "tester",
      email: "tester@example.com",
      passwordHash,
      isEmailVerified: true,
      requiresPasswordChange: false,
      refreshTokenHash: null,
      save: saveMock
    } as unknown as User;

    jest.spyOn(User, "findOne").mockResolvedValue(existingUser);
    jest.spyOn(tokenService, "signAccessToken").mockReturnValue("access-token");
    jest.spyOn(tokenService, "signRefreshToken").mockReturnValue("refresh-token");
    jest.spyOn(tokenService, "getAccessExpirySeconds").mockReturnValue(900);

    const result = await authService.login({
      identifier: "tester@example.com",
      password: "Password@123"
    });

    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiresIn: 900,
      user: {
        id: "u-5",
        username: "tester",
        email: "tester@example.com",
        requiresPasswordChange: false,
        isEmailVerified: true
      }
    });
    expect(existingUser.refreshTokenHash).toBeTruthy();
    expect(existingUser.refreshTokenHash).not.toBe("refresh-token");
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it("refresh succeeds and rotates refresh token hash", async () => {
    const currentRefreshToken = "current-refresh-token";
    const currentRefreshHash = await bcrypt.hash(currentRefreshToken, 8);
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const existingUser = {
      id: "u-6",
      username: "tester",
      email: "tester@example.com",
      isEmailVerified: true,
      requiresPasswordChange: false,
      refreshTokenHash: currentRefreshHash,
      save: saveMock
    } as unknown as User;

    jest.spyOn(tokenService, "verifyRefreshToken").mockReturnValue({
      sub: "u-6",
      email: "tester@example.com",
      username: "tester",
      purpose: "refresh"
    });
    jest.spyOn(User, "findByPk").mockResolvedValue(existingUser);
    jest.spyOn(tokenService, "signAccessToken").mockReturnValue("new-access-token");
    jest.spyOn(tokenService, "signRefreshToken").mockReturnValue("new-refresh-token");
    jest.spyOn(tokenService, "getAccessExpirySeconds").mockReturnValue(900);

    const result = await authService.refresh(currentRefreshToken);

    expect(result).toEqual({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
      expiresIn: 900,
      user: {
        id: "u-6",
        username: "tester",
        email: "tester@example.com",
        requiresPasswordChange: false,
        isEmailVerified: true
      }
    });
    expect(existingUser.refreshTokenHash).toBeTruthy();
    expect(existingUser.refreshTokenHash).not.toBe("new-refresh-token");
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it("refresh fails on token reuse and invalidates stored session token", async () => {
    const refreshTokenFromClient = "reused-or-stolen-token";
    const differentStoredTokenHash = await bcrypt.hash("another-refresh-token", 8);
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const existingUser = {
      id: "u-7",
      username: "tester",
      email: "tester@example.com",
      isEmailVerified: true,
      requiresPasswordChange: false,
      refreshTokenHash: differentStoredTokenHash,
      save: saveMock
    } as unknown as User;

    jest.spyOn(tokenService, "verifyRefreshToken").mockReturnValue({
      sub: "u-7",
      email: "tester@example.com",
      username: "tester",
      purpose: "refresh"
    });
    jest.spyOn(User, "findByPk").mockResolvedValue(existingUser);

    await expect(authService.refresh(refreshTokenFromClient)).rejects.toMatchObject({
      message: "Refresh token reuse detected",
      statusCode: 401
    });
    expect(existingUser.refreshTokenHash).toBeNull();
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it("logout clears refresh token hash for current user session", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const existingUser = {
      id: "u-8",
      refreshTokenHash: "hashed-refresh-token",
      save: saveMock
    } as unknown as User;

    jest.spyOn(User, "findByPk").mockResolvedValue(existingUser);

    await authService.logout("u-8");

    expect(existingUser.refreshTokenHash).toBeNull();
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it("forgotPassword updates temporary password and marks password-change required", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const existingUser = {
      id: "u-9",
      email: "tester@example.com",
      passwordHash: null,
      requiresPasswordChange: false,
      save: saveMock
    } as unknown as User;

    jest.spyOn(User, "findOne").mockResolvedValue(existingUser);
    const sendTemporaryPasswordEmailSpy = jest
      .spyOn(mailService, "sendTemporaryPasswordEmail")
      .mockResolvedValue(undefined);

    await authService.forgotPassword("tester@example.com");

    expect(existingUser.passwordHash).toBeTruthy();
    expect(existingUser.requiresPasswordChange).toBe(true);
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(sendTemporaryPasswordEmailSpy).toHaveBeenCalledTimes(1);
    expect(sendTemporaryPasswordEmailSpy).toHaveBeenCalledWith(
      "tester@example.com",
      expect.any(String)
    );
  });

  it("forgotPassword returns silently when email does not exist", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    const sendTemporaryPasswordEmailSpy = jest
      .spyOn(mailService, "sendTemporaryPasswordEmail")
      .mockResolvedValue(undefined);

    await authService.forgotPassword("missing@example.com");

    expect(sendTemporaryPasswordEmailSpy).not.toHaveBeenCalled();
  });

  it("changePassword updates password and clears password-change + refresh session flags", async () => {
    const saveMock = jest.fn().mockResolvedValue(undefined);
    const existingUser = {
      id: "u-10",
      passwordHash: "old-hash",
      requiresPasswordChange: true,
      refreshTokenHash: "current-refresh-hash",
      save: saveMock
    } as unknown as User;

    jest.spyOn(User, "findByPk").mockResolvedValue(existingUser);

    await authService.changePassword("u-10", "NewPassword@123");

    expect(existingUser.passwordHash).toBeTruthy();
    expect(existingUser.passwordHash).not.toBe("old-hash");
    expect(existingUser.requiresPasswordChange).toBe(false);
    expect(existingUser.refreshTokenHash).toBeNull();
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it("getGoogleAuthorizationUrl returns valid Google OAuth URL", () => {
    env.GOOGLE_CLIENT_ID = "google-client-id";
    env.GOOGLE_CLIENT_SECRET = "google-client-secret";
    env.GOOGLE_REDIRECT_URI = "http://localhost:4000/api/auth/google/callback";

    const authorizationUrl = authService.getGoogleAuthorizationUrl();

    expect(authorizationUrl).toContain("https://accounts.google.com/o/oauth2/v2/auth");
    expect(authorizationUrl).toContain("client_id=google-client-id");
    expect(authorizationUrl).toContain(
      encodeURIComponent("http://localhost:4000/api/auth/google/callback")
    );
  });

  it("loginWithGoogleCode creates new user and issues rotated tokens", async () => {
    env.GOOGLE_CLIENT_ID = "google-client-id";
    env.GOOGLE_CLIENT_SECRET = "google-client-secret";
    env.GOOGLE_REDIRECT_URI = "http://localhost:4000/api/auth/google/callback";

    const saveMock = jest.fn().mockResolvedValue(undefined);
    const createdUser = {
      id: "u-13",
      username: "googletester",
      email: "google@example.com",
      googleId: "google-sub-123",
      isEmailVerified: true,
      requiresPasswordChange: false,
      refreshTokenHash: null,
      save: saveMock
    } as unknown as User;

    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "google-access-token",
        expires_in: 3600,
        token_type: "Bearer",
        scope: "openid email profile"
      })
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sub: "google-sub-123",
        email: "google@example.com",
        email_verified: true,
        name: "Google Tester"
      })
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    jest.spyOn(User, "findOne").mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    jest.spyOn(User, "create").mockResolvedValue(createdUser);
    jest.spyOn(tokenService, "signAccessToken").mockReturnValue("access-token");
    jest.spyOn(tokenService, "signRefreshToken").mockReturnValue("refresh-token");
    jest.spyOn(tokenService, "getAccessExpirySeconds").mockReturnValue(900);

    const result = await authService.loginWithGoogleCode("valid-google-code");

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "google@example.com",
        googleId: "google-sub-123",
        isEmailVerified: true
      })
    );
    expect(result.accessToken).toBe("access-token");
    expect(result.refreshToken).toBe("refresh-token");
    expect(createdUser.refreshTokenHash).toBeTruthy();
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it("loginWithGoogleCode detects token exchange failures", async () => {
    env.GOOGLE_CLIENT_ID = "google-client-id";
    env.GOOGLE_CLIENT_SECRET = "google-client-secret";
    env.GOOGLE_REDIRECT_URI = "http://localhost:4000/api/auth/google/callback";

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({})
    }) as unknown as typeof fetch;

    await expect(authService.loginWithGoogleCode("invalid-code")).rejects.toMatchObject({
      message: "Google OAuth token exchange failed",
      statusCode: 401
    });
  });
});
