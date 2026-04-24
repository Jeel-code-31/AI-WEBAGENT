"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-20 w-20  items-center justify-center">
            <img src="/Icon1.png" alt="Logo" />
          </div>
          <span className="text-xl font-bold tracking-tight">AI Website Analyzer</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium transition-colors hover:text-primary">
            Features
          </Link>
          <Link href="/docs" className="text-sm font-medium transition-colors hover:text-primary">
            Documentation
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button>Get Started</Button>
        </div>
      </div>
    </nav>
  );
}
