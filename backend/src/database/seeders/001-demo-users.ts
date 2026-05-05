import bcrypt from "bcrypt";
import { BCRYPT_SALT_ROUNDS } from "../../constants/auth.constants";
import { User } from "../../models/user.model";

const buildPasswordHash = (password: string): Promise<string> => bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

export const seed001DemoUsers = {
  name: "001-demo-users",
  async run(): Promise<void> {
    const now = new Date();
    const demoUsers = [
      { username: "admin", email: "admin@simpleapp.local", password: "Admin@123" },
      { username: "demo", email: "demo@simpleapp.local", password: "Demo@123" }
    ];

    for (const demoUser of demoUsers) {
      const passwordHash = await buildPasswordHash(demoUser.password);
      const existingUser = await User.findOne({ where: { email: demoUser.email } });

      if (!existingUser) {
        await User.create({
          username: demoUser.username,
          email: demoUser.email,
          passwordHash,
          googleId: null,
          isEmailVerified: true,
          emailVerificationToken: null,
          requiresPasswordChange: false,
          refreshTokenHash: null,
          createdAt: now,
          updatedAt: now
        });
        continue;
      }

      existingUser.username = demoUser.username;
      existingUser.passwordHash = passwordHash;
      existingUser.googleId = null;
      existingUser.isEmailVerified = true;
      existingUser.emailVerificationToken = null;
      existingUser.requiresPasswordChange = false;
      existingUser.refreshTokenHash = null;
      await existingUser.save();
    }
  }
};
