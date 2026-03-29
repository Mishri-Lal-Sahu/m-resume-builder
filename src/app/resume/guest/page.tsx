import Link from "next/link";

import { GuestResumeBuilder } from "@/components/builder/guest-resume-builder";

export default function GuestResumePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto w-full max-w-7xl px-4 pb-2 pt-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Anonymous Resume Builder
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Full builder experience with local autosave only. Nothing is stored on server
          in guest mode.
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Want cloud save and share links?{" "}
          <Link href="/signup" className="underline">
            Create account
          </Link>
        </p>
      </section>
      <GuestResumeBuilder />
    </main>
  );
}
