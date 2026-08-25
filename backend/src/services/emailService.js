import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

const getTransporter = () => {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }

  return transporter;
};

// Sends an email if SMTP is configured. Deliberately never throws — a
// misconfigured or temporarily-down mail provider must not break the
// business flow that triggered it (registration, checkout, password reset).
// Callers that need to know whether the email actually went out can inspect
// the resolved boolean.
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  const transport = getTransporter();

  if (!transport) {
    console.log(`[emailService] SMTP not configured — skipping email to ${to} | Subject: ${subject}`);
    return false;
  }

  try {
    await transport.sendMail({
      from: env.smtp.from || env.smtp.user,
      to,
      subject,
      html,
      attachments,
    });
    return true;
  } catch (err) {
    console.error(`[emailService] Failed to send email to ${to}:`, err.message);
    return false;
  }
};