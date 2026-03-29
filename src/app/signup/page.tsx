import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { getAuthSession } from "@/lib/server/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const session = await getAuthSession();
  if (session) redirect("/dashboard");

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center px-5 py-10 transition-colors duration-200"
      style={{ background: "var(--page-bg)" }}
    >
      <div className="fixed right-4 top-4 z-50"><ThemeToggle /></div>

      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-2xl backdrop-blur-sm transition-colors duration-200"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
      >
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                <path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight transition-colors" style={{ color: "var(--text-primary)" }}>M-Docs</span>
          </Link>
        </div>

        <h1 className="text-xl font-bold transition-colors" style={{ color: "var(--text-primary)" }}>Create your account</h1>
        <p className="mt-1 text-sm transition-colors" style={{ color: "var(--text-secondary)" }}>Join M-Docs — free, no credit card needed.</p>

        <div className="mt-5">
          <SignupForm />
        </div>

        <div className="mt-5 border-t pt-4 transition-colors" style={{ borderColor: "var(--card-border)" }}>
          <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-indigo-500 hover:text-indigo-400 transition">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
