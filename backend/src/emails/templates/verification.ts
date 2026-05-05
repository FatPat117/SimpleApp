/** Mail xác nhận email sau signup. */
export const verificationEmailSubject = "Verify your email address";

export const buildVerificationEmailHtml = (verificationUrl: string): string =>
  `
<h2>Welcome to SimpleApp</h2>
<p>Please verify your email by clicking the link below:</p>
<a href="${verificationUrl}" target="_blank" rel="noopener noreferrer">Verify email</a>
<p>This link will expire in 24 hours.</p>
`.trim();
