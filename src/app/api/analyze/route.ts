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

    // 3. Design System & Tech Detection (Advanced)
    const fonts = new Set<string>();
    const colors = new Set<string>();
    const techStack = new Set<string>();

    let allStyles = $("style").text() + $('[style]').map((_, el) => $(el).attr('style')).get().join(" ");
    const scripts = $("script").map((_, el) => $(el).attr('src') || $(el).text()).get().join(" ");

    // Fetch external stylesheets (max 3 for performance)
    const externalStylesheets = $('link[rel="stylesheet"]').map((_, el) => $(el).attr('href')).get().slice(0, 3);
    for (const href of externalStylesheets) {
      try {
        let fullUrl = href;
        if (!href.startsWith("http")) {
          const baseUrl = new URL(formattedUrl).origin;
          fullUrl = new URL(href, baseUrl).href;
        }
        const cssRes = await fetch(fullUrl, { signal: AbortSignal.timeout(5000) });
        if (cssRes.ok) {
          allStyles += await cssRes.text();
        }
      } catch (e) {
        // Skip if failed
      }
    }

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
      colors.add(c.toLowerCase());
    });


    // 4. Technology Fingerprinting
    // 4. Technology Fingerprinting (Elite & Accurate)
    const fingerprints: { [key: string]: RegExp } = {
      // Frameworks
      "Next.js": /next-head|next-js|_next|__NEXT_DATA__/i,
      "React": /react-root|_react|React\.createElement|data-reactroot/i,
      "Vue.js": /vue\.js|v-bind|v-if|data-v-|__vue__/i,
      "Nuxt.js": /__NUXT__|nuxt-link/i,
      "Angular": /ng-version|ng-app|ng-binding|_ngcontent/i,
      "Svelte": /svelte-|__svelte/i,
      "Remix": /__remix_manifest|remix-run/i,
      "Gatsby": /gatsby-image|gatsby-link|__GATSBY/i,
      "Astro": /astro-[\w\d]+|data-astro-/i,
      "Qwik": /q-container|q-base|q-id/i,
      "Preact": /preact/i,
      "SolidJS": /__solid/i,
      "Alpine.js": /x-data|x-init|x-show|alpine\.js/i,
      "Ember": /ember-application|ember-view/i,
      "Backbone.js": /backbone\.js/i,
      
      // Styling
      "Tailwind CSS": /tailwind|tw-[\w-]+|aspect-h-|bg-opacity-|text-opacity-|ring-offset-/i,
      "Bootstrap": /bootstrap\.min\.css|bootstrap\.bundle\.min\.js|bs-[\w-]+|navbar-expand-[\w]+|container-fluid|col-(xs|sm|md|lg|xl)-/i,
      "Bulma": /is-primary|is-flex|is-grid|has-text-/i,
      "Foundation": /foundation-mq|foundation-settings/i,
      "UIkit": /uk-navbar|uk-container|uk-grid/i,
      "Chakra UI": /chakra-|css-[\w\d]+-[\w\d]+/i,
      "MUI (Material UI)": /MuiButton-|MuiTypography-|MuiBox-/i,
      "Ant Design": /ant-btn|ant-layout|ant-menu/i,
      "Styled Components": /sc-[\w\d]+|data-styled/i,
      
      // Platforms & CMS
      "WordPress": /wp-content|wp-includes|wordpress|wp-json/i,
      "Shopify": /shopify|cdn\.shopify\.com|shopify-section/i,
      "Webflow": /webflow\.com|w-custom-css|w-node-|w-block/i,
      "Wix": /wix\.com|wix-style|wix-image/i,
      "Ghost": /ghost-org|ghost-sdk/i,
      "Docusaurus": /docusaurus|infima/i,
      "Squarespace": /squarespace|sqs-/i,
      "HubSpot": /hubspot\.com|hs-script-loader/i,
      "Sanity": /cdn\.sanity\.io/i,
      "Contentful": /ctfassets\.net/i,
      "Strapi": /strapi/i,
      
      // Static Site Generators
      "Hugo": /hugo/i,
      "Jekyll": /jekyll/i,
      "Eleventy": /11ty/i,
      
      // Animation & Interaction
      "Framer Motion": /framer-motion/i,
      "GSAP": /gsap|TweenMax|TimelineLite|ScrollTrigger/i,
      "Three.js": /three\.js|three\.min\.js/i,
      "Lottie": /lottie-player|dotLottie/i,
      
      // Infrastructure & Utils
      "Vercel": /vercel/i,
      "Cloudflare": /cloudflare/i,
      "Netlify": /netlify/i,
      "Stripe": /stripe\.com|StripeCheckout/i,
      "jQuery": /jquery|cdn\.jsdelivr\.net\/npm\/jquery/i,
      "Google Analytics": /google-analytics\.com|gtag/i,
      "Intercom": /intercomcdn\.com|intercom-messenger/i,
    };


    // Check Meta Generator tag
    const generator = $('meta[name="generator"]').attr("content");
    if (generator) {
      if (generator.toLowerCase().includes("next.js")) techStack.add("Next.js");
      if (generator.toLowerCase().includes("wordpress")) techStack.add("WordPress");
      if (generator.toLowerCase().includes("webflow")) techStack.add("Webflow");
      if (generator.toLowerCase().includes("ghost")) techStack.add("Ghost");
      if (generator.toLowerCase().includes("docusaurus")) techStack.add("Docusaurus");
      if (generator.toLowerCase().includes("wix")) techStack.add("Wix");
    }

    Object.entries(fingerprints).forEach(([name, pattern]) => {
      if (pattern.test(html) || pattern.test(scripts) || pattern.test(allStyles)) {
        techStack.add(name);
      }
    });

    // Smart Filtering & Header Checks
    const poweredBy = response.headers.get("x-powered-by");
    if (poweredBy) {
      if (/next\.js/i.test(poweredBy)) techStack.add("Next.js");
      if (/express/i.test(poweredBy)) techStack.add("Express");
      if (/php/i.test(poweredBy)) techStack.add("PHP");
      if (/asp\.net/i.test(poweredBy)) techStack.add("ASP.NET");
    }

    const server = response.headers.get("server");
    if (server) {
      if (/cloudflare/i.test(server)) techStack.add("Cloudflare");
      if (/vercel/i.test(server)) techStack.add("Vercel");
      if (/netlify/i.test(server)) techStack.add("Netlify");
      if (/nginx/i.test(server)) techStack.add("Nginx");
      if (/apache/i.test(server)) techStack.add("Apache");
    }

    // Additional logic for specific libraries
    if (html.includes("data-framer-portal")) techStack.add("Framer");
    if (html.includes("spline-viewer")) techStack.add("Spline");
    if (html.includes("canvas") && html.includes("webgl")) techStack.add("WebGL");

    const finalTechStack = Array.from(techStack).sort();

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
      techStack: finalTechStack,
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
        score: Math.max(10, Math.min(100, Math.round(
          Math.max(0, 100 - (pageSizeKb / 200)) * 0.4 + 
          Math.max(0, 100 - (scriptCount * 1.2)) * 0.3 + 
          (accessibilityScore) * 0.2 +
          (isHttps ? 10 : 0)
        )))
      },
      responsive: !!$('meta[name="viewport"]').attr("content")
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to analyze website." }, { status: 500 });
  }
}
