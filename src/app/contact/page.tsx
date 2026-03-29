export const metadata = { title: "Contact Us | M-Docs" };

export default function ContactPage() {
  return (
    <div className="flex-1 mx-auto w-full max-w-4xl px-5 py-12 sm:px-10 sm:py-20">
      <h1 className="mb-10 text-3xl font-bold sm:text-5xl transition-colors" style={{ color: "var(--text-primary)" }}>
        Contact Us
      </h1>
      <section title="Contact Us">
        <p>
          We value your feedback and are here to assist with any questions, issues, or partnership inquiries you might have regarding M-Docs.
        </p>
        <div className="mt-8 flex flex-col gap-6 sm:flex-row">
          <div className="flex-1 rounded-2xl border p-6" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
            </div>
            <h3 className="mb-1 font-bold" style={{ color: "var(--text-primary)" }}>Email Support</h3>
            <p className="text-sm mb-4">For all technical support, billing inquiries, and general questions.</p>
            <a href="mailto:m-docs@m-pg.in" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500">
              m-docs@m-pg.in
            </a>
          </div>
        </div>
        <p className="mt-8 text-sm">
          M-Docs is developed by <strong>M-Prime Group</strong> (<a href="https://m-pg.in" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">m-pg.in</a>). We typically respond to support requests within 24-48 hours.
        </p>
      </section>
    </div>
  );
}
