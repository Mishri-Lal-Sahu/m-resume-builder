"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      console.log(result);
      if (result?.error === "EmailNotVerified") {
        setError("EmailNotVerified");
      } else {
        setError("Invalid credentials. Please try again.");
      }
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 outline-none ring-zinc-900 dark:ring-zinc-200 transition focus:ring-2"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 outline-none ring-zinc-900 dark:ring-zinc-200 transition focus:ring-2"
        />
      </div>
      {error === "EmailNotVerified" ? (
        <div className="rounded-md bg-yellow-50 flex flex-col items-start p-3 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/50">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
            Your email is not verified yet.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/verify-otp?email=${encodeURIComponent(email)}`)}
            className="text-sm font-bold text-yellow-900 hover:text-yellow-700 underline dark:text-yellow-400 dark:hover:text-yellow-200"
          >
            Proceed to verify email &rarr;
          </button>
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:hover:bg-zinc-200 dark:hover:text-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
