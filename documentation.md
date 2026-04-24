# AI Website Analyzer - Full Project Documentation

This document provides a comprehensive overview of the AI Website Analyzer project, including the system architecture, complexity analysis, and the advanced problem-solving techniques used during development.
---
## 🚀 Project Overview
The AI Website Analyzer is an elite-tier "Open Agent" that provides real-time, deep-scan insights into any public URL. It analyzes SEO, Design Systems, Security, Technology Stacks, and Performance.

---

## 🏗 System Architecture & Workflow

### 1. High-Level Workflow
1.  **Frontend Entry**: The user interacts with a Next.js 15 client-side landing page.
2.  **Verification Layer**: Debounced input calls `/api/check-url` to ensure the domain is reachable before deep analysis.
3.  **Processing Engine**: `/api/analyze` performs a server-side fetch and parses the HTML using Cheerio.
4.  **Visual Reveal**: Structured JSON data is revealed in the UI using a "Typewriter" effect with Framer Motion.

### 2. Core API Modules
*   **`/api/check-url`**: Lightweight connectivity check using `HEAD` requests.
*   **`/api/analyze`**: Deep scraper for metadata, tech-stack fingerprinting, and design tokens.

---

## ⚖️ Complexity Analysis: Hard vs. Easy

Building a high-performance analyzer involves balancing speed with accuracy. Below is a breakdown of the development complexity.

### ✅ The Easy Parts
*   **UI Scaffolding**: Building the responsive layout with Tailwind CSS and Shadcn UI.
*   **Basic Metadata Extraction**: Fetching the `<title>` and `<meta description>` tags using standard Cheerio selectors.
*   **Navigation & Routing**: Implementing the Next.js App Router for the landing page and documentation page.

### 🧩 The Hard Parts
*   **Design System Extraction**: Accurately finding the "actual" color palette and font-family from raw CSS/HTML without a headless browser.
*   **Social Graph Visibility**: Solving the issue where `og:image` URLs were often relative or blocked by third-party "hotlinking" protections.
*   **Real-time Status Synchronization**: Managing the transition between "Idle", "Checking", "Exists", and "Analyzing" states without hydration errors.
*   **Tech Stack Fingerprinting**: Creating a robust way to identify frameworks (Next.js, React, Tailwind) purely from HTML signatures and script paths.

---

## 🛠 Problem-Solving Techniques Used

To solve the "Hard" challenges listed above, the following advanced techniques were implemented:

### 1. Signature-Based Fingerprinting
*   **Problem**: How to detect technologies like "Next.js" or "Shopify" without a full browser?
*   **Solution**: We implemented a dictionary of "fingerprints"—RegEx patterns that look for specific markers in the HTML (e.g., `_next/static` for Next.js, `cdn.shopify.com` for Shopify). This is extremely fast and high-accuracy.

### 2. URL Normalization & Resolution
*   **Problem**: Relative paths in `og:image` (like `/thumb.png`) break the frontend display.
*   **Solution**: We used the `URL` constructor in the backend to combine the base website URL with the relative path, ensuring the frontend always receives a valid, absolute absolute URL.

### 3. No-Referrer Policy for Media
*   **Problem**: Secured sites (like Google) block images if the request comes from your domain.
*   **Solution**: We added `referrer Policy="no-referrer"` to the `<img>` tags. This instructs the browser to hide where the request is coming from, effectively bypassing most hotlinking protections.

### 4. Advanced RegEx CSS Parsing
*   **Problem**: Extracting hex codes and fonts from thousands of lines of CSS.
*   **Solution**: We used aggressive Global RegEx patterns (`/#(?:[0-9a-fA-F]{3,4}){1,2}\b/g`) to scan the entire HTML payload, including internal `<style>` tags and inline `style=""` attributes.

### 5. Abort Controller for Timeouts
*   **Problem**: Slow websites could hang the server indefinitely.
*   **Solution**: Every API call is wrapped in an `AbortController` with a strict timeout (10s for check, 20s for analysis). This ensures the application remains responsive even if the target site is down.

---

## 🛠 Tech Stack Summary
*   **Frontend**: Next.js 15, Tailwind CSS, Framer Motion, Lucide Icons.
*   **Backend**: Node.js, Cheerio (for high-speed parsing).
*   **Deployment**: Ready for Vercel.

