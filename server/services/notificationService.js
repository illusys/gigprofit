async function sendEmail({ to, subject, text }) {
  // Production-ready abstraction point: replace with SES/Postmark/SendGrid provider.
  console.log(`[email queued] to=${to} subject=${subject} body=${text}`);
  return { queued: true };
}

async function sendEmailVerification(user, token) {
  return sendEmail({ to: user.email, subject: 'Verify your GigProfit email', text: `Verification token: ${token}` });
}

async function sendPasswordReset(user, token) {
  return sendEmail({ to: user.email, subject: 'Reset your GigProfit password', text: `Password reset token: ${token}` });
}

async function sendAdminAlert(subject, text) {
  return sendEmail({ to: process.env.ADMIN_ALERT_EMAIL || process.env.SUPER_ADMIN_EMAIL, subject, text });
}

module.exports = { sendEmail, sendEmailVerification, sendPasswordReset, sendAdminAlert };
