import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    
    const response = await fetch(formattedUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Website returned an error: ${response.status}` }, { status: 400 });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. Meta & Content
    const title = $("title").text() || "No title found";
    const description = $('meta[name="description"]').attr("content") || "No description found";
    // 1. Precise Hero Image Detection
    let heroImage = $("section[class*='hero'] img, #hero img, .hero img, [class*='banner'] img").first().attr("src");
    
    // 2. Fallback to main content images (filtering out icons/avatars)
    if (!heroImage) {
      heroImage = $("main img, article img").filter((_, el) => {
        const src = $(el).attr("src") || "";
        const className = $(el).attr("class") || "";
        const alt = $(el).attr("alt") || "";
        const isIcon = /icon|logo|avatar|svg|btn|social/i.test(src + className + alt);
        return !isIcon && src.length > 0;
      }).first().attr("src");
    }

    // 3. Final Fallback to OG Tags
    let ogImage = heroImage || $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content");

    // Clean and Normalize
    ogImage = ogImage?.trim();
    if (ogImage && !ogImage.startsWith("http")) {
      try {
        const baseUrl = new URL(formattedUrl).origin;
        ogImage = new URL(ogImage, baseUrl).href;
      } catch (e) {
        ogImage = undefined;
      }
    }
    
    const headings = {
      h1: $("h1").map((_, el) => $(el).text().trim()).get(),
      h2: $("h2").map((_, el) => $(el).text().trim()).get().slice(0, 5),
      h3: $("h3").map((_, el) => $(el).text().trim()).get().slice(0, 5),
      h1Count: $("h1").length,
      h2Count: $("h2").length,
      h3Count: $("h3").length,
    };

    // 2. Security
    const isHttps = formattedUrl.startsWith("https");
    const securityHeaders = {
      hsts: !!response.headers.get("strict-transport-security"),
      csp: !!response.headers.get("content-security-policy"),
      xFrameOptions: response.headers.get("x-frame-options") || "Not set",
    };

    // 3. Design System Detection (Elite)
    const fonts = new Set<string>();
    const colors = new Set<string>();
    const techStack = new Set<string>();

    const allStyles = $("style").text() + $('[style]').map((_, el) => $(el).attr('style')).get().join(" ");
    const scripts = $("script").map((_, el) => $(el).attr('src') || $(el).text()).get().join(" ");

    // Font Detection
    const fontRegex = /font-family:\s*([^;!]+)/gi;
    let match;
    while ((match = fontRegex.exec(allStyles)) !== null) {
      const name = match[1].split(",")[0].replace(/['"]/g, "").trim();
      if (name && name.length < 40 && !["inherit", "serif", "sans-serif", "initial", "unset", "system-ui"].includes(name.toLowerCase())) {
        fonts.add(name);
      }
    }

    // Color Detection (Aggressive)
    const hexRegex = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
    const rgbRegex = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)/g;
    
    const hexMatches = allStyles.match(hexRegex) || [];
    const rgbMatches = allStyles.match(rgbRegex) || [];
    
    [...hexMatches, ...rgbMatches].forEach(c => {
      // Filter out very light/dark or redundant colors
      colors.add(c.toLowerCase());
    });

    // 4. Technology Fingerprinting
    const fingerprints: { [key: string]: string | RegExp } = {
      "Next.js": /next-head|next-js|_next/i,
      "React": /react-root|_react|React\.createElement/i,
      "Vue.js": /vue\.js|v-bind|v-if|data-v-/i,
      "Angular": /ng-version|ng-app|ng-binding/i,
      "Tailwind CSS": /tailwind|tw-|aspect-h-/i,
      "Bootstrap": /bootstrap|bs-|navbar-expand/i,
      "WordPress": /wp-content|wp-includes|wordpress/i,
      "Shopify": /shopify|cdn\.shopify\.com/i,
      "Webflow": /webflow\.com|w-custom-css/i,
      "Wix": /wix\.com|wix-style/i,
      "Framer Motion": /framer-motion/i,
      "GSAP": /gsap|TweenMax|TimelineLite/i,
      "Vercel": /vercel/i,
      "Cloudflare": /cloudflare/i,
      "Stripe": /stripe\.com|StripeCheckout/i,
      "jQuery": /jquery|cdn\.jsdelivr\.net\/npm\/jquery/i,
    };

    Object.entries(fingerprints).forEach(([name, pattern]) => {
      if (typeof pattern === "string") {
        if (html.includes(pattern) || scripts.includes(pattern)) techStack.add(name);
      } else if (pattern.test(html) || pattern.test(scripts) || pattern.test(allStyles)) {
        techStack.add(name);
      }
    });

    // 5. Accessibility
    const images = $("img");
    const imgWithAlt = $("img[alt]");
    const accessibilityScore = images.length > 0 ? Math.round((imgWithAlt.length / images.length) * 100) : 100;

    // 6. Performance Metrics
    const pageSizeKb = Math.round(Buffer.byteLength(html, 'utf8') / 1024);
    const scriptCount = $("script").length;
    const loadTimeEstimate = (pageSizeKb / 200).toFixed(2);

    return NextResponse.json({
      url: formattedUrl,
      title,
      description,
      ogImage,
      headings,
      security: {
        isHttps,
        ...securityHeaders,
        status: isHttps ? "Secure" : "Insecure"
      },
      design: {
        fonts: Array.from(fonts).slice(0, 5),
        colors: Array.from(colors).slice(0, 8),
      },
      techStack: Array.from(techStack),
      accessibility: {
        score: accessibilityScore,
        totalImages: images.length,
        missingAlt: images.length - imgWithAlt.length
      },
      performance: {
        pageSizeKb,
        scripts: scriptCount,
        imageCount: images.length,
        loadTimeEstimate: `${loadTimeEstimate}s`,
        score: Math.max(0, 100 - (pageSizeKb / 50) - (scriptCount * 2))
      },
      responsive: !!$('meta[name="viewport"]').attr("content")
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to analyze website." }, { status: 500 });
  }
}
