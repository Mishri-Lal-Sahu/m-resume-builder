"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
    ),
    title: "Multi-Page Documents",
    body: "Auto-paginating A4 pages with real headers, footers, and overflow detection.",
    color: "from-indigo-500 to-violet-500",
    glow: "shadow-indigo-500/20",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
    ),
    title: "Rich Text Editing",
    body: "Full TipTap editor — headings, tables, images, lists, code blocks, and more.",
    color: "from-cyan-500 to-blue-500",
    glow: "shadow-cyan-500/20",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
    ),
    title: "Auto Save",
    body: "Every keystroke is debounced and saved to the cloud automatically.",
    color: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/20",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
    ),
    title: "Dark Mode",
    body: "Full dark and light theme support — toggle anytime with one click.",
    color: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
    ),
    title: "Perfect Print",
    body: "Print exactly what you see — every page maps to one A4 sheet.",
    color: "from-orange-500 to-rose-500",
    glow: "shadow-orange-500/20",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
    ),
    title: "Document Outline",
    body: "Live sidebar outline pulls headings and titles as you write.",
    color: "from-pink-500 to-rose-500",
    glow: "shadow-pink-500/20",
  },
];

const steps = [
  { num: "01", title: "Create a Document", body: "Sign up free and create a new document in seconds. Choose from templates or start blank." },
  { num: "02", title: "Write & Format", body: "Use the rich editor — headings, tables, images, e-signatures, charts, and more at your fingertips." },
  { num: "03", title: "Export & Share", body: "Download as PDF, share via link, or print directly. Your docs are always in the cloud." },
];


// ─── Animated Counter ─────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-1"
    >
      <span className="text-3xl font-bold text-white dark:text-white sm:text-4xl" style={{ color: "var(--text-primary)" }}>{value}</span>
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>{label}</span>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    delay: i * 0.4,
    x: (i * 5.5 + 3) % 100,
    size: 4 + (i % 5) * 3,
  }));

  return (

    <>
      {/* ── Hero ── */}
      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-5 pb-12 pt-14 text-center sm:px-10 sm:pt-24 sm:pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border dark:border-indigo-500/30 dark:bg-indigo-950/60 border-indigo-500/30 bg-indigo-950/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-300 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
          Now in Beta — M-Docs
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="text-4xl font-bold tracking-tight dark:text-white text-black sm:text-6xl lg:text-7xl"
          style={{ lineHeight: 1.1 }}
        >
          Write smarter.
          <br />
          <span className="animate-gradient dark:bg-gradient-to-r dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Format beautifully.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
          className="mx-auto mt-6 max-w-xl text-base leading-8 text-zinc-400 sm:text-lg"
        >
          M-Docs is a smart, multi-page document editor with real A4 pagination, rich text,
          auto-save, and per-page headers and footers — far beyond a basic word processor.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 transition hover:from-indigo-500 hover:to-violet-500"
            >
              Start Writing Free
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-7 py-3.5 text-sm font-semibold text-zinc-300 backdrop-blur-sm transition hover:border-zinc-500 hover:text-white"
            >
              Open Dashboard
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 flex flex-wrap justify-center gap-8 sm:gap-16"
        >
          <StatCard value="∞" label="Pages" />
          <StatCard value="A4" label="Precision" />
          <StatCard value="0ms" label="Save Lag" />
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-20 sm:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-10 text-center text-xs font-bold uppercase tracking-[0.2em] text-indigo-400"
        >
          Everything you need
        </motion.h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`group relative overflow-hidden rounded-2xl border dark:border-white/[0.07] dark:bg-white/[0.03] border-black/[0.3] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.14] hover:shadow-xl ${f.glow}`}
            >
              {/* Icon */}
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-lg`}>
                {f.icon}
              </div>
              <h3 className="text-sm font-bold dark:text-white text-black">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-zinc-400">{f.body}</p>
              {/* Shimmer on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)" }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-20 sm:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center text-xs font-bold uppercase tracking-[0.2em] text-violet-400"
        >
          How it works
        </motion.h2>
        <div className="flex flex-col gap-0 md:flex-row md:gap-0">
          {steps.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              className="relative flex flex-1 flex-col items-center px-4 pb-10 text-center md:pb-0"
            >
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="absolute top-6 left-[calc(50%+32px)] hidden h-px w-full bg-gradient-to-r from-indigo-500/40 to-violet-500/20 md:block" />
              )}
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
                {step.num}
              </div>
              <h3 className="mb-2 text-sm font-bold dark:text-white text-black">{step.title}</h3>
              <p className="text-sm leading-6 text-zinc-400">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-24 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/90 to-violet-950/90 p-8 text-center backdrop-blur-sm sm:p-14"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="animate-glow-pulse absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 -translate-y-1/3 rounded-full bg-indigo-500/25 blur-3xl" />
          </div>
          <h2 className="relative text-2xl font-bold text-white sm:text-3xl">Ready to write something great?</h2>
          <p className="relative mt-3 dark:text-zinc-400 text-white">Join M-Docs and start creating multi-page documents in seconds.</p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/signup" className="inline-block rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 transition hover:from-indigo-500 hover:to-violet-500">
                Get Started Free
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/login" className="inline-block rounded-xl border dark:border-zinc-700 dark:text-zinc-300 px-8 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white">
                Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

    </>
  );
}
