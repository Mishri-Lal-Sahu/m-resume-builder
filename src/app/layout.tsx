import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "@/components/providers";
import "./globals.css";
import { Particle } from "@/components/ui/Particle";
import { Navbar, Footer } from "@/components/layout/Shell";

export const metadata: Metadata = {
  title: "M-Docs — Smart Document Editor",
  description: "The smart, advanced document editor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    delay: i * 0.4,
    x: (i * 5.5 + 3) % 100,
    size: 4 + (i % 5) * 3,
  }));

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {/* Inline script runs before React hydrates — prevents flash of wrong theme */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`}
        </Script>
        <Providers>
          <div className="flex flex-col min-h-screen transition-colors duration-200" style={{ background: "var(--page-bg)" }}>
            
            {/* ── Background Layer ── */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
              {/* Orbs */}
              <div className="animate-glow-pulse absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-indigo-700/20 blur-[130px]" />
              <div className="animate-glow-pulse absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-violet-700/15 blur-[110px]" style={{ animationDelay: "1.5s" }} />
              <div className="animate-glow-pulse absolute bottom-0 -left-10 h-[400px] w-[400px] rounded-full bg-cyan-700/12 blur-[100px]" style={{ animationDelay: "3s" }} />
              {/* Grid */}
              <div
                className="absolute inset-0 opacity-[0.035]"
                style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
                  backgroundSize: "52px 52px",
                }}
              />
              {/* Particles */}
              {particles.map((p) => <Particle key={p.id} delay={p.delay} x={p.x} size={p.size} />)}
            </div>

            <Navbar />

            <main className="relative z-10 flex-1 flex flex-col">
              {children}
            </main>

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
