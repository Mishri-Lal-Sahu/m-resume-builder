import "server-only";

import nodemailer from "nodemailer";
import { db } from "@/lib/server/db";
import { decryptField } from "@/lib/server/settings";

type MailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

async function getSmtpConfig() {
  // 1. Try DB settings first
  try {
    const settings = await (db as any).adminSettings.findFirst();
    if (settings?.smtpHost && settings?.smtpPort && settings?.smtpUser && settings?.smtpPassEncrypted) {
      const pass = decryptField(settings.smtpPassEncrypted);
      if (pass) {
        return {
          host: settings.smtpHost,
          port: settings.smtpPort,
          user: settings.smtpUser,
          pass,
          from: settings.smtpFrom || settings.smtpUser,
        };
      }
    }
  } catch {
    // Fall through to env vars
  }

  // 2. Fall back to environment variables
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    return { host, port, user, pass, from: user };
  }

  return null;
}

export function professionalOtpEmail(otp: string, action: string = "verification"): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Requested Action: ${action}</h2>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.5; margin-bottom: 24px;">
        Use the following one-time password (OTP) to complete your ${action}. This code is valid for a limited time.
      </p>
      
      <div style="background-color: #f3f4f6; border-radius: 6px; padding: 16px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 0.2em; color: #111827;">${otp}</span>
      </div>
      
      <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
        If you didn't request this code, you can safely ignore this email.
        <br/><br/>
        &copy; ${new Date().getFullYear()} M-Docs Platform.
      </p>
    </div>
  `;
}

export async function sendMail(params: MailParams) {
  const config = await getSmtpConfig();

  if (!config) {
    // Dev fallback — log to console
    console.info("[mail:dev-fallback]", {
      to: params.to,
      subject: params.subject,
      text: params.text,
    });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });
}
