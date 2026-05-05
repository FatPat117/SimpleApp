import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { User } from "../models/user.model";
import { AppError } from "../utils/AppError";
import { generateTempPassword } from "../utils/generateTempPassword";
import { mailService } from "./mail.service";
import { tokenService } from "./token.service";

const SALT_ROUNDS = 12;

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    email: string;
    requiresPasswordChange: boolean;
    isEmailVerified: boolean;
  };
};

const buildAuthResponse = (user: User): AuthResponse => {
  const payload = {
    sub: user.id,
    email: user.email,
    username: user.username
  };
  const accessToken = tokenService.signAccessToken(payload);
  const refreshToken = tokenService.signRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    expiresIn: tokenService.getAccessExpirySeconds(),
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      requiresPasswordChange: user.requiresPasswordChange,
      isEmailVerified: user.isEmailVerified
    }
  };
};

export const authService = {
  async signup(input: { username: string; email: string; password: string }): Promise<void> {
    const duplicatedUser = await User.findOne({
      where: {
        [Op.or]: [{ email: input.email }, { username: input.username }]
      }
    });

    if (duplicatedUser) {
      throw new AppError("Email or username already in use", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
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
    const payload = tokenService.verifyEmailVerificationToken(token);
    const user = await User.findByPk(payload.sub);
    if (!user || user.emailVerificationToken !== token) {
      throw new AppError("Invalid verification token", 400);
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
    user.refreshTokenHash = await bcrypt.hash(authData.refreshToken, SALT_ROUNDS);
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
    if (!isCurrentToken) {
      user.refreshTokenHash = null;
      await user.save();
      throw new AppError("Refresh token reuse detected", 401);
    }

    const authData = buildAuthResponse(user);
    user.refreshTokenHash = await bcrypt.hash(authData.refreshToken, SALT_ROUNDS);
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
    if (!user) {
      return;
    }

    const temporaryPassword = generateTempPassword(12);
    user.passwordHash = await bcrypt.hash(temporaryPassword, SALT_ROUNDS);
    user.requiresPasswordChange = true;
    await user.save();

    await mailService.sendTemporaryPasswordEmail(user.email, temporaryPassword);
  },

  async changePassword(userId: string, newPassword: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.requiresPasswordChange = false;
    user.refreshTokenHash = null;
    await user.save();
  }
};
