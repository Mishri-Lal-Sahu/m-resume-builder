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
    const settings = await db.adminSettings.findFirst();
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
