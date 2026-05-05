import { env } from "../config/env";
import { mailTransporter } from "../config/mailer";

export const mailService = {
  async sendVerificationEmail(recipientEmail: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;
    await mailTransporter.sendMail({
      from: env.SMTP_FROM,
      to: recipientEmail,
      subject: "Verify your email address",
      html: `
        <h2>Welcome to SimpleApp</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" target="_blank" rel="noopener noreferrer">Verify email</a>
        <p>This link will expire in 24 hours.</p>
      `
    });
  },

  async sendTemporaryPasswordEmail(recipientEmail: string, temporaryPassword: string): Promise<void> {
    await mailTransporter.sendMail({
      from: env.SMTP_FROM,
      to: recipientEmail,
      subject: "Your temporary password",
      html: `
        <h2>Temporary password request</h2>
        <p>Your temporary password is:</p>
        <p><strong>${temporaryPassword}</strong></p>
        <p>Please sign in and change your password immediately.</p>
      `
    });
  }
};
