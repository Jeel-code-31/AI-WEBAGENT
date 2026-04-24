"use client";

import { Navbar } from "@/components/navbar";
import { motion } from "framer-motion";
import { Terminal, Cpu, Globe, Shield, Zap, Layout } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight">Technical Documentation</h1>
            <p className="text-xl text-muted-foreground">
              Architecture, workflows, and API specifications for the AI Website Analyzer.
            </p>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Cpu className="h-6 w-6 text-primary" /> System Workflow
            </h2>
            <div className="grid gap-4 border-l-2 border-primary/20 pl-6 ml-3">
              <div className="space-y-2">
                <h3 className="font-bold">1. Debounced URL Validation</h3>
                <p className="text-sm text-muted-foreground">
                  The frontend monitors user input and triggers a lightweight HEAD request to `/api/check-url` after 800ms of inactivity. This prevents unnecessary scanning of invalid domains.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold">2. Deep Extraction Engine</h3>
                <p className="text-sm text-muted-foreground">
                  Upon clicking "Analyze Now", the system triggers `/api/analyze`. This server-side route fetches the full HTML and uses Cheerio to parse metadata, design tokens, and security headers.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold">3. Staggered Printing Reveal</h3>
                <p className="text-sm text-muted-foreground">
                  Data is processed and sent back as a structured JSON. The frontend uses a custom Typewriter component and Framer Motion to reveal the results sequentially, enhancing perceived value and readability.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Terminal className="h-6 w-6 text-primary" /> API Specification
            </h2>
            <div className="space-y-8">
              <div className="rounded-xl border bg-muted/30 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-blue-500">GET</Badge>
                  <code className="text-sm font-bold">/api/analyze?url=...</code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">The core analysis engine for metadata, design, and performance.</p>
                <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4">
                  <li>Scans internal & external CSS for Hex/RGB palettes.</li>
                  <li>Fingerprints 15+ modern web frameworks and tools.</li>
                  <li>Audits SSL, HSTS, and CSP security protocols.</li>
                  <li>Calculates accessibility scores based on Image Alt attributes.</li>
                </ul>
              </div>

              <div className="rounded-xl border bg-muted/30 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-purple-500">POST</Badge>
                  <code className="text-sm font-bold">/api/check-url</code>
                </div>
                <p className="text-sm text-muted-foreground mb-4">A high-speed connectivity check used for real-time UI feedback.</p>
                <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4">
                  <li>Uses lightweight HEAD requests to minimize bandwidth.</li>
                  <li>Includes advanced timeout handling for slow networks.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Layout className="h-6 w-6 text-primary" /> Technical Rationale
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-4 rounded-xl border bg-background shadow-sm">
                <h3 className="font-bold mb-2">Why Cheerio?</h3>
                <p className="text-xs text-muted-foreground">
                  Cheerio is ~10x faster than headless browsers like Puppeteer. It provides high-speed parsing for SEO-critical data without the massive memory overhead of a browser instance.
                </p>
              </div>
              <div className="p-4 rounded-xl border bg-background shadow-sm">
                <h3 className="font-bold mb-2">Social Preview Fix</h3>
                <p className="text-xs text-muted-foreground">
                  We use a `no-referrer` policy for Social Graph images to bypass hotlinking restrictions, ensuring OG images load even from secured third-party domains.
                </p>
              </div>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${className}`}>
      {children}
    </span>
  );
}
