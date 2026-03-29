export const metadata = { title: "Disclaimer | M-Docs" };

export default function DisclaimerPage() {
  return (
    <div className="flex-1 mx-auto w-full max-w-4xl px-5 py-12 sm:px-10 sm:py-20">
      <h1 className="mb-10 text-3xl font-bold sm:text-5xl transition-colors" style={{ color: "var(--text-primary)" }}>
        Disclaimer
      </h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-8 mb-8 rounded-xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-800/50 dark:bg-indigo-950/40">
        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
          M-Docs is a product developed and maintained by M-Prime Group (<a href="https://m-pg.in" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">m-pg.in</a>).
        </p>
      </div>

      <h2 className="mt-8 mb-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>General Information</h2>
      <p>
        The information and services provided by M-Docs are for general informational and document-creation purposes only. All information on the platform is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information or service on the site.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>External Links</h2>
      <p>
        The site may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.
      </p>

      <h2 className="mt-8 mb-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>Professional Disclaimer</h2>
      <p>
        The M-Docs service cannot and does not contain legal or professional document advice. The use or reliance of any information contained or generated on this site is solely at your own risk.
      </p>
    </div>
  );
}
