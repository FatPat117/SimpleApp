/** Auth domain: signup/verify/login, refresh + reuse, Google, forgot/change password. */
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { googleOAuthClient } from "../clients/google-oauth.client";
import { BCRYPT_SALT_ROUNDS } from "../constants/auth.constants";
import { User } from "../models/user.model";
import type { AuthResponse } from "../types/auth.types";
import { AppError } from "../utils/AppError";
import { buildAuthResponse } from "../utils/buildAuthSession";
import { generateTempPassword } from "../utils/generateTempPassword";
import { generateUniqueUsername } from "../utils/username.util";
import { mailService } from "./mail.service";
import { tokenService } from "./token.service";

export const authService = {
  getGoogleAuthorizationUrl(): string {
    return googleOAuthClient.getAuthorizationUrl();
  },

  async signup(input: { username: string; email: string; password: string }): Promise<void> {
    const duplicatedUser = await User.findOne({
      where: {
        [Op.or]: [{ email: input.email }, { username: input.username }]
      }
    });

    if (duplicatedUser) {
      throw new AppError("Email or username already in use", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);
    const user = await User.create({
      username: input.username,
      email: input.email,
      passwordHash,
      isEmailVerified: false,
      requiresPasswordChange: false
    });

    const verificationToken = tokenService.signEmailVerificationToken({
      sub: user.id,
      email: user.email,
      username: user.username
    });
    user.emailVerificationToken = verificationToken;
    await user.save();

    await mailService.sendVerificationEmail(user.email, verificationToken);
  },

  async verifyEmail(token: string): Promise<void> {
    let payload;
    try {
      payload = tokenService.verifyEmailVerificationToken(token);
    } catch (error) {
      if (error instanceof AppError && error.code === "TOKEN_EXPIRED") {
        throw new AppError("Verification link expired", 400, "VERIFICATION_TOKEN_EXPIRED");
      }
      throw error;
    }

    const user = await User.findByPk(payload.sub);
    if (!user) {
      throw new AppError("User not found for this verification token", 404, "VERIFICATION_USER_NOT_FOUND");
    }

    if (user.isEmailVerified) {
      throw new AppError("Email is already verified", 409, "EMAIL_ALREADY_VERIFIED");
    }

    if (!user.emailVerificationToken) {
      throw new AppError(
        "No active verification token for this account",
        400,
        "VERIFICATION_TOKEN_NOT_ACTIVE"
      );
    }

    if (user.emailVerificationToken !== token) {
      throw new AppError("Verification token mismatch", 400, "VERIFICATION_TOKEN_MISMATCH");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await user.save();
  },

  async login(input: { identifier: string; password: string }): Promise<AuthResponse> {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: input.identifier.toLowerCase() }, { username: input.identifier }]
      }
    });

    if (!user || !user.passwordHash) {
      throw new AppError("Invalid credentials", 401);
    }

    const passwordMatched = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatched) {
      throw new AppError("Invalid credentials", 401);
    }

    if (!user.isEmailVerified) {
      throw new AppError("Email not verified", 403);
    }

    const authData = buildAuthResponse(user);
    user.refreshTokenHash = await bcrypt.hash(authData.refreshToken, BCRYPT_SALT_ROUNDS);
    await user.save();

    return authData;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const payload = tokenService.verifyRefreshToken(refreshToken);
    const user = await User.findByPk(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new AppError("Invalid refresh token", 401);
    }

    const isCurrentToken = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    // Refresh token cũ sau khi đã rotate → có thể bị reuse → huỷ session.
    if (!isCurrentToken) {
      user.refreshTokenHash = null;
      await user.save();
      throw new AppError("Refresh token reuse detected", 401);
    }

    const authData = buildAuthResponse(user);
    user.refreshTokenHash = await bcrypt.hash(authData.refreshToken, BCRYPT_SALT_ROUNDS);
    await user.save();

    return authData;
  },

  async logout(userId: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      return;
    }
    user.refreshTokenHash = null;
    await user.save();
  },

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });
    // Không có user vẫn im lặng — tránh lộ email có tài khoản hay không.
    if (!user) {
      return;
    }

    const temporaryPassword = generateTempPassword(12);
    user.passwordHash = await bcrypt.hash(temporaryPassword, BCRYPT_SALT_ROUNDS);
    user.requiresPasswordChange = true;
    await user.save();

    await mailService.sendTemporaryPasswordEmail(user.email, temporaryPassword);
  },

  async changePassword(userId: string, newPassword: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    user.requiresPasswordChange = false;
    user.refreshTokenHash = null;
    await user.save();
  },

  async loginWithGoogleCode(code: string): Promise<AuthResponse> {
    const tokenPayload = await googleOAuthClient.exchangeCodeForTokens(code);
    const googleProfile = await googleOAuthClient.fetchUserInfo(tokenPayload.access_token);

    let user = await User.findOne({
      where: {
        [Op.or]: [{ googleId: googleProfile.sub }, { email: googleProfile.email.toLowerCase() }]
      }
    });

    if (!user) {
      const derivedName = googleProfile.name ?? googleProfile.email.split("@")[0];
      const username = await generateUniqueUsername(derivedName);
      user = await User.create({
        username,
        email: googleProfile.email.toLowerCase(),
        googleId: googleProfile.sub,
        isEmailVerified: googleProfile.email_verified,
        requiresPasswordChange: false,
        passwordHash: null
      });
    } else {
      user.googleId = user.googleId ?? googleProfile.sub;
      if (googleProfile.email_verified && !user.isEmailVerified) {
        user.isEmailVerified = true;
      }
    }

    const authData = buildAuthResponse(user);
    user.refreshTokenHash = await bcrypt.hash(authData.refreshToken, BCRYPT_SALT_ROUNDS);
    await user.save();

    return authData;
  }
};
