/** Gửi mail (nodemailer); HTML trong `emails/templates`. */
import { env } from "../config/env";
import { mailTransporter } from "../config/mailer";
import {
  buildTemporaryPasswordEmailHtml,
  buildVerificationEmailHtml,
  temporaryPasswordEmailSubject,
  verificationEmailSubject
} from "../emails/templates";

export const mailService = {
  async sendVerificationEmail(recipientEmail: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;
    await mailTransporter.sendMail({
      from: env.SMTP_FROM,
      to: recipientEmail,
      subject: verificationEmailSubject,
      html: buildVerificationEmailHtml(verificationUrl)
    });
  },

  async sendTemporaryPasswordEmail(recipientEmail: string, temporaryPassword: string): Promise<void> {
    await mailTransporter.sendMail({
      from: env.SMTP_FROM,
      to: recipientEmail,
      subject: temporaryPasswordEmailSubject,
      html: buildTemporaryPasswordEmailHtml(temporaryPassword)
    });
  }
};
