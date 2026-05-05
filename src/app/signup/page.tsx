import Link from "next/link";
import Image from "next/image";
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
            <Image
              src="/android-chrome-192x192.png"
              alt="M-Docs logo"
              width={40}
              height={40}
              className="rounded-xl shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105"
              priority
            />
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
