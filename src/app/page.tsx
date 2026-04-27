"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Shield, Zap, Palette, Globe, CheckCircle2, ArrowRight, XCircle, Cpu, Eye, Activity, Layout, Terminal, Smartphone, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [checkStatus, setCheckStatus] = useState<"idle" | "checking" | "exists" | "not-exists">("idle");
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (!url) {
      setCheckStatus("idle");
      setAnalysisResult(null);
      return;
    }

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      setCheckStatus("idle");
      return;
    }

    const timer = setTimeout(async () => {
      setCheckStatus("checking");
      try {
        const response = await fetch("/api/check-url", {
          method: "POST",
          body: JSON.stringify({ url }),
        });
        const data = await response.json();
        setCheckStatus(data.exists ? "exists" : "not-exists");
      } catch (error) {
        setCheckStatus("not-exists");
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [url]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || checkStatus !== "exists") return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch(`/api/analyze?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }
      const data = await response.json();
      setAnalysisResult(data);
    } catch (error: any) {
      alert(error.message || "Failed to analyze website.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const TypewriterText = ({ text, delay }: { text: string, delay: number }) => {
    const [displayedText, setDisplayedText] = useState("");
    useEffect(() => {
      if (text) {
        const timer = setTimeout(() => {
          let i = 0;
          const interval = setInterval(() => {
            setDisplayedText(text.slice(0, i + 1));
            i++;
            if (i >= text.length) clearInterval(interval);
          }, 15);
          return () => clearInterval(interval);
        }, delay * 1000);
        return () => clearTimeout(timer);
      }
    }, [text, delay]);
    return <span>{displayedText}</span>;
  };

  const AnalysisCard = ({ title, icon: Icon, delay, children }: { title: string, icon: any, delay: number, children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group"
    >
      <Card className="h-full border-none bg-background/40 shadow-lg backdrop-blur-xl ring-1 ring-primary/10 transition-all hover:ring-primary/30">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );

  const getStatusIcon = () => {
    switch (checkStatus) {
      case "checking":
        return <Zap className="h-5 w-5 animate-spin text-purple-500" />;
      case "exists":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "not-exists":
        return <XCircle className="h-5 w-5 text-rose-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (checkStatus) {
      case "checking":
        return "Checking...";
      case "exists":
        return "URL Exists";
      case "not-exists":
        return "URL Not Found";
      default:
        return null;
    }
  };

  const features = [
    // ... existing features
    {
      icon: <Shield className="h-6 w-6 text-purple-500" />,
      title: "Security Analysis",
      description: "SSL certificate check, security headers, and vulnerability assessment."
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: "Performance",
      description: "Load speeds, asset optimization, and Lighthouse-grade metrics."
    },
    {
      icon: <Palette className="h-6 w-6 text-blue-500" />,
      title: "Design System",
      description: "Font detection, color palette extraction, and spacing consistency."
    },
    {
      icon: <Globe className="h-6 w-6 text-green-500" />,
      title: "SEO & Accessibility",
      description: "Meta tags, heading structure, alt text, and mobile responsiveness."
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
          {/* Background Gradients */}
          <div className="absolute top-0 -z-10 h-full w-full">
            <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-purple-500/20 blur-[120px]" />
            <div className="absolute bottom-0 right-0 h-[300px] w-[500px] bg-blue-500/10 blur-[100px]" />
          </div>

          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight xs:text-5xl sm:text-6xl md:text-7xl">
                AI Website <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Analyzer</span>
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl px-2">
                Analyze any website's security, performance, and design system instantly with our powerful AI-driven engine.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto max-w-2xl"
            >
              <form onSubmit={handleAnalyze} className="relative flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    type="text"
                    placeholder="example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className={cn(
                      "h-14 pl-10 pr-10 sm:pr-32 text-base sm:text-lg shadow-xl transition-all",
                      checkStatus === "exists" && "border-emerald-500/50 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20",
                      checkStatus === "not-exists" && "border-rose-500/50 focus-visible:border-rose-500 focus-visible:ring-rose-500/20"
                    )}
                    required
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: checkStatus !== "idle" ? 1 : 0, x: checkStatus !== "idle" ? 0 : 10 }}
                      className="flex items-center gap-1.5"
                    >
                      {getStatusIcon()}
                      <span className={cn(
                        "hidden sm:inline text-xs font-medium",
                        checkStatus === "checking" && "text-purple-500",
                        checkStatus === "exists" && "text-emerald-500",
                        checkStatus === "not-exists" && "text-rose-500"
                      )}>
                        {getStatusMessage()}
                      </span>
                    </motion.div>
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold shadow-xl"
                  disabled={isAnalyzing || checkStatus !== "exists"}
                >
                  {isAnalyzing ? (
                    <>
                      <Zap className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
              <p className="mt-4 text-sm text-muted-foreground">
                Enter any URL to get started. No sign-up required for free analysis.
              </p>

              {/* Recent History Removed */}
            </motion.div>
          </div>
        </section>

        {analysisResult && (
          <section className="container mx-auto px-4 pb-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-12 flex flex-col items-center justify-between gap-6 rounded-3xl bg-primary/5 p-8 md:flex-row"
            >
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle className="stroke-muted fill-none" strokeWidth="8" cx="50" cy="50" r="40" />
                    <motion.circle
                      className="stroke-primary fill-none"
                      strokeWidth="8"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      initial={{ strokeDasharray: "0 251" }}
                      animate={{ strokeDasharray: `${(analysisResult.performance.score / 100) * 251} 251` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <span className="absolute text-xl font-black sm:text-2xl">{analysisResult.performance.score}</span>
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold sm:text-3xl">Overall Health</h2>
                  <p className="text-sm text-muted-foreground sm:text-base">Comprehensive audit for {analysisResult.url}</p>
                </div>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
                <Button variant="outline" onClick={() => window.print()} className="w-full gap-2 rounded-xl sm:w-auto">
                  <Share2 className="h-4 w-4" /> Export Report
                </Button>
                <Button className="w-full gap-2 rounded-xl sm:w-auto">
                  <Zap className="h-4 w-4" /> Rescan Now
                </Button>
              </div>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnalysisCard title="Meta & Content" icon={Layout} delay={0.1}>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Title</div>
                    <div className="mt-1 text-sm font-semibold line-clamp-2"><TypewriterText text={analysisResult.title} delay={0.2} /></div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</div>
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-3"><TypewriterText text={analysisResult.description} delay={0.4} /></div>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold">{analysisResult.headings.h1Count}</span>
                      <span className="text-[10px] text-muted-foreground">H1 Tags</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold">{analysisResult.headings.h2Count}</span>
                      <span className="text-[10px] text-muted-foreground">H2 Tags</span>
                    </div>
                  </div>
                </div>
              </AnalysisCard>

              <AnalysisCard title="Design System" icon={Palette} delay={0.2}>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Color Palette</div>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.design.colors.map((c: string, i: number) => (
                        <div key={i} className="h-8 w-8 rounded-lg border shadow-sm transition-transform hover:scale-110" style={{ backgroundColor: c }} title={c} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Typography</div>
                    <div className="flex flex-col gap-2">
                      {analysisResult.design.fonts.map((f: string, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm rounded-md bg-muted/50 px-2 py-1">
                          <span style={{ fontFamily: f }}>{f}</span>
                          <span className="text-[10px] opacity-50">Active</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnalysisCard>

              <AnalysisCard title="Technology Stack" icon={Cpu} delay={0.3}>
                <div className="flex flex-col gap-4">
                  <div className="text-xs text-muted-foreground mb-1">Detected Frameworks & Tools</div>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.techStack.map((tech: string, i: number) => (
                      <Badge key={i} variant="secondary" className="px-3 py-1 text-xs font-semibold">
                        <Terminal className="mr-1.5 h-3 w-3" /> {tech}
                      </Badge>
                    ))}
                    {analysisResult.techStack.length === 0 && <div className="text-sm italic opacity-50">Undetected</div>}
                  </div>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="text-xs font-medium">Responsive Viewport</span>
                    <Badge variant={analysisResult.responsive ? "default" : "destructive"} className="h-6">
                      {analysisResult.responsive ? "Optimized" : "Missing"}
                    </Badge>
                  </div>
                </div>
              </AnalysisCard>

              <AnalysisCard title="Security" icon={Shield} delay={0.4}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SSL Encryption</span>
                    {analysisResult.security.isHttps ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-rose-500" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">HSTS Protocol</span>
                    {analysisResult.security.hsts ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-rose-500" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CSP Header</span>
                    {analysisResult.security.csp ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-rose-500" />}
                  </div>
                  <div className="pt-4 mt-4 border-t text-[10px] text-muted-foreground">
                    X-FRAME: {analysisResult.security.xFrameOptions}
                  </div>
                </div>
              </AnalysisCard>

              <AnalysisCard title="Accessibility" icon={Eye} delay={0.5}>
                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-medium">Image Alt Health</span>
                    <span className="text-xs font-bold">{analysisResult.accessibility.score}%</span>
                  </div>
                  <Progress value={analysisResult.accessibility.score} className="h-2" />
                  <div className="grid grid-cols-2 gap-3 mt-6 sm:gap-4">
                    <div className="rounded-xl bg-muted/50 p-3 text-center transition-colors hover:bg-muted/80">
                      <div className="text-lg font-bold sm:text-xl">{analysisResult.accessibility.totalImages}</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-tight sm:text-[10px]">Total Imgs</div>
                    </div>
                    <div className="rounded-xl bg-destructive/10 p-3 text-center transition-colors hover:bg-destructive/20">
                      <div className="text-lg font-bold text-destructive sm:text-xl">{analysisResult.accessibility.missingAlt}</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-tight sm:text-[10px]">Missing Alt</div>
                    </div>
                  </div>
                </div>
              </AnalysisCard>

              <AnalysisCard title="Performance" icon={Activity} delay={0.6}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Load Time</span>
                    </div>
                    <span className="text-sm font-bold">{analysisResult.performance.loadTimeEstimate}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Page Size</span>
                    </div>
                    <span className="text-sm font-bold">{analysisResult.performance.pageSizeKb} KB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Scripts</span>
                    </div>
                    <span className="text-sm font-bold">{analysisResult.performance.scripts}</span>
                  </div>
                </div>
              </AnalysisCard>

              <AnalysisCard title="Social Graph" icon={Share2} delay={0.7}>
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-xl border bg-muted/20">
                    {analysisResult.ogImage ? (
                      <img
                        src={analysisResult.ogImage}
                        alt="Social Preview"
                        className="h-32 w-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex h-32 w-full items-center justify-center bg-muted text-xs text-muted-foreground">Image Blocked or Not Found</div>';
                        }}
                      />
                    ) : (
                      <div className="flex h-32 w-full items-center justify-center bg-muted text-xs text-muted-foreground">No OG Image Found</div>
                    )}
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-primary truncate uppercase">{analysisResult.url}</div>
                      <div className="text-xs font-semibold line-clamp-1">{analysisResult.title}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground italic text-center">Preview of how the site appears when shared</div>
                </div>
              </AnalysisCard>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section id="features" className="bg-slate-50 py-24 dark:bg-slate-900/50">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Everything you need to optimize</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Our AI engine scans deep into the code and structure to provide actionable insights.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full border-none bg-background/50 shadow-sm transition-all hover:shadow-md dark:bg-slate-800/50">
                    <CardContent className="pt-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-background shadow-sm">
                        {feature.icon}
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof / Stats */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale transition-all hover:grayscale-0 md:gap-12">
              <div className="flex items-center gap-2 text-xl font-bold sm:text-2xl">Vercel</div>
              <div className="flex items-center gap-2 text-xl font-bold sm:text-2xl">Stripe</div>
              <div className="flex items-center gap-2 text-xl font-bold sm:text-2xl">OpenAI</div>
              <div className="flex items-center gap-2 text-xl font-bold sm:text-2xl">Linear</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background/50 py-12 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight">AI Analyzer</span>
            </div>

            <div className="text-center text-sm text-muted-foreground md:text-left">
              © 2026 AI Analyzer SaaS. All rights reserved.
            </div>

            <div className="text-sm font-medium">
              The Website is Developed By{" "}
              <a
                href="https://port-folio-jeel-darji.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline underline-offset-4 transition-all"
              >
                JEEL DARJI
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
