import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main
      className="relative min-h-screen flex flex-col transition-colors duration-200"
      style={{ background: "var(--page-bg)" }}
    >
      {/* Standard top nav from landing page style */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-10 sm:py-5 border-b transition-colors" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/android-chrome-192x192.png"
            alt="M-Docs logo"
            width={36}
            height={36}
            className="rounded-xl shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105"
          />
          <span className="text-lg font-bold tracking-tight transition-colors" style={{ color: "var(--text-primary)" }}>
            M-Docs
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium transition" style={{ color: "var(--text-secondary)" }}>
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 mx-auto w-full max-w-4xl px-5 py-12 sm:px-10 sm:py-20">
        <h1 className="mb-10 text-3xl font-bold sm:text-5xl transition-colors" style={{ color: "var(--text-primary)" }}>
          {title}
        </h1>
        <div className="space-y-6 text-sm sm:text-base leading-relaxed transition-colors" style={{ color: "var(--text-secondary)" }}>
          {children}
        </div>
      </div>

      {/* Footer minimal */}
      <footer className="border-t px-5 py-6 text-center text-xs transition-colors" style={{ borderColor: "var(--card-border)", color: "var(--text-muted)" }}>
        <span>© {new Date().getFullYear()} M-Docs. Developed by <a href="https://m-pg.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-500 hover:text-indigo-400">M-Prime Group</a></span>
      </footer>
    </main>
  );
}
