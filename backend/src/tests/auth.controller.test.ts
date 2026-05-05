import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { googleAuth, googleCallback, logout } from "../controllers/auth.controller";
import { authService } from "../services/auth.service";
import { tokenService } from "../services/token.service";

describe("Auth controller", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("logout clears auth cookies and invalidates user session", async () => {
    const req = {
      user: {
        id: "u-11",
        email: "tester@example.com",
        username: "tester"
      }
    } as Request;

    const statusMock = jest.fn().mockReturnThis();
    const jsonMock = jest.fn().mockReturnThis();
    const res = {
      status: statusMock,
      json: jsonMock
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    const logoutServiceSpy = jest.spyOn(authService, "logout").mockResolvedValue(undefined);
    const clearCookiesSpy = jest.spyOn(tokenService, "clearAuthCookies").mockImplementation(() => undefined);

    logout(req, res, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(logoutServiceSpy).toHaveBeenCalledWith("u-11");
    expect(clearCookiesSpy).toHaveBeenCalledWith(res);
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: "Logged out successfully",
      data: null
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("googleAuth redirects to provider authorization URL", async () => {
    const req = {} as Request;
    const redirectMock = jest.fn().mockReturnThis();
    const res = {
      redirect: redirectMock
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    jest
      .spyOn(authService, "getGoogleAuthorizationUrl")
      .mockReturnValue("https://accounts.google.com/o/oauth2/v2/auth?mock=true");

    googleAuth(req, res, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(redirectMock).toHaveBeenCalledWith(
      "https://accounts.google.com/o/oauth2/v2/auth?mock=true"
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("googleCallback sets cookies then redirects to dashboard", async () => {
    const req = {
      query: {
        code: "google-auth-code"
      }
    } as unknown as Request;
    const redirectMock = jest.fn().mockReturnThis();
    const res = {
      redirect: redirectMock
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    jest.spyOn(authService, "loginWithGoogleCode").mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiresIn: 900,
      user: {
        id: "u-12",
        username: "tester",
        email: "tester@example.com",
        requiresPasswordChange: false,
        isEmailVerified: true
      }
    });
    const setAuthCookiesSpy = jest
      .spyOn(tokenService, "setAuthCookies")
      .mockImplementation(() => undefined);

    googleCallback(req, res, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(authService.loginWithGoogleCode).toHaveBeenCalledWith("google-auth-code");
    expect(setAuthCookiesSpy).toHaveBeenCalledWith(res, "access-token", "refresh-token");
    expect(redirectMock).toHaveBeenCalledWith(`${env.FRONTEND_URL}/dashboard`);
    expect(next).not.toHaveBeenCalled();
  });
});
