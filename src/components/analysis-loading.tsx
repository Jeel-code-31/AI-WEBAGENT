"use client";

import { motion } from "framer-motion";
import { Zap, Search, Shield, Globe, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AnalysisLoading({ url }: { url: string }) {
  const steps = [
    { icon: <Globe className="h-5 w-5" />, text: "Connecting to server..." },
    { icon: <Search className="h-5 w-5" />, text: "Scanning metadata..." },
    { icon: <Shield className="h-5 w-5" />, text: "Checking security headers..." },
    { icon: <Zap className="h-5 w-5" />, text: "Measuring performance..." },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden border-none shadow-2xl dark:bg-slate-900">
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-white shadow-lg">
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
            </div>
            
            <h2 className="mb-2 text-2xl font-bold">Analyzing Website</h2>
            <p className="mb-8 text-sm text-muted-foreground truncate w-full px-4">
              {url}
            </p>

            <div className="w-full space-y-4 text-left">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.5 }}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="text-purple-500">{step.icon}</div>
                  <span className="text-sm font-medium">{step.text}</span>
                  <motion.div 
                    className="ml-auto"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.5 + 0.3 }}
                  >
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            <p className="mt-8 text-xs text-muted-foreground italic">
              "Great things take a moment to perfect..."
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
