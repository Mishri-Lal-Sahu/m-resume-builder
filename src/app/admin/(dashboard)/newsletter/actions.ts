"use server";

import { db } from "@/lib/server/db";
import { getAuthSession } from "@/lib/server/auth";
import { sendMail } from "@/lib/server/mailer";

export async function sendNewsletter(subject: string, text: string) {
  const session = await getAuthSession();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  if (!subject.trim() || !text.trim()) {
    return { error: "Subject and message bodies are required." };
  }

  const subscribers = await db.newsletterSubscriber.findMany({
    where: { isActive: true },
    select: { email: true },
  });

  if (subscribers.length === 0) {
    return { error: "There are no active subscribers to send this to." };
  }

  try {
    // Simple batch sending. For larger scale, a managed queue (bullmq, etc) is recommended.
    const batchPromises = subscribers?.map((sub) =>
      sendMail({
        to: sub.email,
        subject,
        text,
        html: `<div style="font-family:sans-serif;line-height:1.5;">${text.replace(/\n/g, "<br/>")}</div>`,
      })
    );
    
    await Promise.allSettled(batchPromises);

    return { success: true, count: subscribers.length };
  } catch (error) {
    console.error("Newsletter submission failed:", error);
    return { error: "An unexpected error occurred while dispatching the newsletter." };
  }
}
