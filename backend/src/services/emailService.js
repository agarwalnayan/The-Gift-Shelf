import { env } from '../config/env.js';

export const sendEmail = async ({ to, subject, html }) => {
  if (env.nodeEnv !== 'production') {
    console.log(`[emailService] Email to ${to} | Subject: ${subject}`);
    return;
  }

  // Wire up a transport (e.g. nodemailer with SMTP creds from env.smtp)
  // once production email credentials are available.
};
