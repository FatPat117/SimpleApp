import { Op } from "sequelize";
import { User } from "../models/user.model";
import { AppError } from "../utils/AppError";

export const userService = {
  async getById(userId: string): Promise<User | null> {
    return User.findByPk(userId);
  },

  async updateMe(userId: string, payload: { username?: string; email?: string }): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (payload.username && payload.username !== user.username) {
      const usernameExists = await User.findOne({
        where: {
          username: payload.username,
          id: { [Op.ne]: userId }
        }
      });
      if (usernameExists) {
        throw new AppError("Username already in use", 409);
      }
      user.username = payload.username;
    }

    if (payload.email && payload.email.toLowerCase() !== user.email) {
      const normalizedEmail = payload.email.toLowerCase();
      const emailExists = await User.findOne({
        where: {
          email: normalizedEmail,
          id: { [Op.ne]: userId }
        }
      });
      if (emailExists) {
        throw new AppError("Email already in use", 409);
      }
      user.email = normalizedEmail;
    }

    await user.save();
    return user;
  }
};
