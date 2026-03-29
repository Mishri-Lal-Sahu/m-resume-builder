import { LegalLayout } from "@/components/ui/legal-layout";

export const metadata = { title: "Terms of Service | M-Docs" };

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>
        Please read these Terms of Service carefully before using the M-Docs platform operated by M-Prime Group ("we", "us", or "our").
      </p>

      <h2 className="mt-8 mb-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>1. Agreement to Terms</h2>
      <p>
        By accessing or using M-Docs, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>2. User Accounts</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>You must provide accurate, complete, and current information when creating an account.</li>
        <li>You are responsible for safeguarding the password that you use to access the service.</li>
        <li>You agree not to disclose your password to any third party and to notify us immediately upon becoming aware of any security breach.</li>
      </ul>

      <h2 className="mt-8 mb-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>3. Content Ownership and Responsibility</h2>
      <p>
        Our service allows you to post, link, store, share, and otherwise make available text, graphics, or other material ("Content"). You retain all rights to any Content you submit, post or display on or through the service and you are responsible for protecting those rights. 
        You agree that you will not upload content that is illegal, offensive, or violates intellectual property rights.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>4. Service Availability</h2>
      <p>
        We do not guarantee that our service will be available seamlessly across all regions or at all times. We reserve the right to withdraw or amend the service at any time without notice.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>5. Limitation of Liability</h2>
      <p>
        In no event shall M-Prime Group, nor its directors, employees, partners, agents, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
      </p>
    </LegalLayout>
  );
}
