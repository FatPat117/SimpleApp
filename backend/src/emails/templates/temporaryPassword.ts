/** Mail gửi mật khẩu tạm sau forgot-password. */
export const temporaryPasswordEmailSubject = "Your temporary password";

export const buildTemporaryPasswordEmailHtml = (temporaryPassword: string): string =>
  `
<h2>Temporary password request</h2>
<p>Your temporary password is:</p>
<p><strong>${temporaryPassword}</strong></p>
<p>Please sign in and change your password immediately.</p>
`.trim();
