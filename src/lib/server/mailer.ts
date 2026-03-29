import "server-only";

import nodemailer from "nodemailer";

function hasSmtpConfig() {
  return (
    !!process.env.SMTP_HOST &&
    !!process.env.SMTP_PORT &&
    !!process.env.SMTP_USER &&
    !!process.env.SMTP_PASS
  );
}

export async function sendMail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  if (!hasSmtpConfig()) {
    console.info("[mail:dev-fallback]", {
      to: params.to,
      subject: params.subject,
      text: params.text,
    });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });
}
