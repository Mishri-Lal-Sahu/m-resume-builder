import Link from "next/link";

export const metadata = { title: "Privacy Policy | M-Docs" };

export default function PrivacyPage() {
  return (
    <div className="flex-1 mx-auto w-full max-w-4xl px-5 py-12 sm:px-10 sm:py-20">
      <h1 className="mb-10 text-3xl font-bold sm:text-5xl transition-colors" style={{ color: "var(--text-primary)" }}>
        Privacy Policy
      </h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>
        At M-Docs (developed by M-Prime Group), we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our document editing platform.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>1. Information We Collect</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Account Information:</strong> When you register, we collect your name, email address, and encrypted password.</li>
        <li><strong>User Content:</strong> The documents, text, and images you create or upload to M-Docs are securely stored in our database so you can access them across devices.</li>
        <li><strong>Usage Data:</strong> We may collect anonymous analytics data regarding how the service is accessed and used.</li>
      </ul>

      <h2 className="mt-8 mb-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>2. How We Use Your Information</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>To provide and maintain the M-Docs service.</li>
        <li>To authenticate your identity and protect your account.</li>
        <li>To notify you about changes, updates, or technical issues regarding the platform.</li>
      </ul>

      <h2 className="mt-8 mb-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>3. Data Security</h2>
      <p>
        We implement industry-standard security measures to ensure the safety of your personal information. Passwords are cryptographically hashed, and data transmission occurs over secure, encrypted channels. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>4. Document Privacy and Sharing</h2>
      <p>
        By default, all documents created on M-Docs are <strong>Private</strong>. You explicitly choose to share your documents by changing their visibility to "Public" or "Link Only". You maintain full control over your document sharing settings at all times.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>5. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please <Link href="/contact" className="text-indigo-500 hover:underline">contact us</Link>.
      </p>
    </div>
  );
}
