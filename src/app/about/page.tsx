export const metadata = { title: "About Us | M-Docs" };

export default function AboutPage() {
  return (
    <div className="flex-1 mx-auto w-full max-w-4xl px-5 py-12 sm:px-10 sm:py-20">
      <h1 className="mb-10 text-3xl font-bold sm:text-5xl transition-colors" style={{ color: "var(--text-primary)" }}>
        About Us
      </h1>
      <div className="space-y-6 text-sm sm:text-base leading-relaxed transition-colors" style={{ color: "var(--text-secondary)" }}>

        <section >
          <p>
            Welcome to <strong>M-Docs</strong>, a modern platform designed to revolutionize how professionals create, manage, and share multi-page documents.
          </p>
          <p>
            Built with a focus on speed, beautiful design, and seamless editing, M-Docs provides a robust TipTap-powered rich text editor that automatically paginates content into precise A4 dimensions. Whether you&apos;re drafting proposals, resumes, or comprehensive reports, what you see on the screen is exactly what prints on paper.
          </p>
          <h2 className="mt-8 mb-4 text-xl font-bold" style={{ color: "var(--text-primary)" }}>Our Mission</h2>
          <p>
            Our goal is to eliminate the friction from traditional word processors. We provide instant auto-saving, beautiful PDF exports, and responsive themes so you can focus entirely on what matters: your content.
          </p>
          <div className="mt-12 rounded-2xl border p-6" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
            <h3 className="mb-2 font-bold" style={{ color: "var(--text-primary)" }}>Developed By</h3>
            <p>
              M-Docs is proudly developed and maintained by{" "}
              <a href="https://m-pg.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-500 hover:text-indigo-400 underline">
                M-Prime Group
              </a>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
