import { db } from "@/lib/server/db";
import { NewsletterForm } from "@/components/admin/newsletter-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Newsletter | M-Docs Admin" };

export default async function AdminNewsletterPage() {
  const activeCount = await db.newsletterSubscriber.count({
    where: { isActive: true },
  });

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl transition-colors" style={{ color: "var(--text-primary)" }}>
          Newsletter
        </h1>
        <p className="mt-1 text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
          Compose and dispatch broadcast emails securely to your subscribers.
        </p>
      </div>

      <div className="rounded-2xl border p-6 transition-colors shadow-sm" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
        <NewsletterForm subscriberCount={activeCount} />
      </div>
    </div>
  );
}
