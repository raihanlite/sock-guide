import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import Image from "@11ty/eleventy-img";

// Short content hash of the stylesheet, for cache-busting the <link> tag:
// the file is cached 10 minutes by the host and a changed hash forces
// browsers to fetch the new stylesheet instead of a stale copy.
const cssHash = createHash("sha256")
  .update(readFileSync(new URL("./src/css/style.css", import.meta.url)))
  .digest("hex")
  .slice(0, 8);

// Responsive images (eleventy-img): generated WebP + JPEG at the widths
// each slot actually displays, with srcset/sizes and width/height. The
// generated files live under _site/img/ with /sock-guide/img/ URLs, so
// the prefixUrls transform leaves them alone. Widths larger than the
// source are replaced by the source width (no upscaling).
const IMG_URL_PATH = "/sock-guide/img/";
const IMG_OUTPUT_DIR = "./_site/img/";
const IMG_PRESETS = {
  hero: { widths: [400, 800, 1200], sizes: "(max-width: 820px) 100vw, 540px", loading: "eager" },
  articleHero: { widths: [400, 800, 1200], sizes: "(max-width: 900px) 100vw, 860px", loading: "eager" },
  card: { widths: [400, 800], sizes: "(max-width: 820px) 100vw, 330px", loading: "lazy" },
  catCard: { widths: [400, 800], sizes: "(max-width: 820px) 100vw, 500px", loading: "lazy" },
  thumb: { widths: [200, 400], sizes: "(max-width: 560px) 150px, 190px", loading: "lazy" },
};

async function responsiveImage(src, alt, preset) {
  const p = IMG_PRESETS[preset] || IMG_PRESETS.card;
  const metadata = await Image(path.join("src", String(src).replace(/^\//, "")), {
    widths: p.widths,
    formats: ["webp", "jpeg"],
    urlPath: IMG_URL_PATH,
    outputDir: IMG_OUTPUT_DIR,
    filenameFormat: (id, src, width, format) => {
      const name = path.basename(src, path.extname(src));
      return `${name}-${width}w.${format}`;
    },
  });
  return Image.generateHTML(metadata, {
    alt: alt || "",
    sizes: p.sizes,
    loading: p.loading,
    decoding: "async",
  });
}

// Strip HTML tags and decode the few entities used in post bodies, for
// plain-text answers in FAQPage JSON-LD.
function stripTags(s) {
  return String(s)
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export default function(eleventyConfig) {
  // Site display order: the 4 featured guides (hero + 3 cards) first,
  // then Latest Posts order. latestPosts excludes the featured four;
  // the search index uses the full order. New posts are prepended to
  // artifactOrder (see the December posting schedule).
  const featured = [
      "best-work-socks",
      "best-socks-for-work-boots",
      "best-alpaca-socks",
      "best-heated-socks-for-hunting",
    ];
  const artifactOrder = [
      "best-compression-socks-for-nurses",
      "best-socks-for-school",
      "best-basketball-socks",
      "best-football-socks",
      "best-everyday-socks",
      "best-socks-for-women",
      "best-socks-for-men",
      "sock-fabrics",
      "how-to-knit-a-sock",
      "what-are-compression-socks-used-for",
      "how-long-can-you-wear-compression-socks",
      "how-socks-are-made",
      "best-heated-socks",
      "history-of-socks",
      "best-merino-wool-socks",
      "how-to-take-care-of-socks",
      "best-socks-for-sweaty-feet",
      "types-of-socks",
      "what-are-socks-why-do-we-wear-socks",
      "best-running-socks",
      "best-socks-for-christmas-gifts",
      "why-do-socks-make-your-feet-sweat",
      "crew-socks-vs-ankle-socks",
      "how-to-choose-the-right-socks",
      "cotton-vs-merino-wool-socks",
      "best-socks-for-summer",
      "best-tennis-socks",
    ];
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  // Favicon set (sock icon, brand magenta #e0218a) — served from site root.
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/favicon-16x16.png");
  eleventyConfig.addPassthroughCopy("src/favicon-32x32.png");
  eleventyConfig.addPassthroughCopy("src/apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy("src/android-chrome-192x192.png");
  eleventyConfig.addPassthroughCopy("src/android-chrome-512x512.png");
  eleventyConfig.addPassthroughCopy("src/site.webmanifest");
  // YYYY-MM-DD for Article JSON-LD datePublished (front matter date).
  // Latest Posts: all posts newest-first, excluding the 4 featured on the
  // homepage (hero + 3 cards) so they do not repeat in the list.
  // Compare fileSlug, not url: page.url already includes the pathPrefix.
  // Several guides share one publish month and the artifact's order is
  // not date order (see below), so the artifact's order is applied
  // explicitly to keep Latest Posts identical to the artifact.
  eleventyConfig.addCollection("latestPosts", (collectionApi) => {
    // The artifact's Latest Posts order is authoritative: it is not
    // derivable from dates alone (in the artifact Crew Socks vs Ankle
    // Socks precedes How to Choose the Right Socks, although its publish
    // date is earlier), so posts listed here keep exactly that order.
    // Anything not listed falls back to newest-first by date.
    return collectionApi.getFilteredByTag("posts")
      .filter((p) => !featured.includes(p.fileSlug))
      .sort((a, b) => {
        const ia = artifactOrder.indexOf(a.fileSlug);
        const ib = artifactOrder.indexOf(b.fileSlug);
        if (ia !== -1 && ib !== -1) return ia - ib;
        const byDate = b.date - a.date;
        if (byDate !== 0) return byDate;
        return ia === -1 ? 1 : -1;
      });
  });
  // Search index order: every post in the site's display order — the 4
  // featured guides first (hero + 3 cards), then Latest Posts order.
  // Anything not listed falls back to newest-first by date.
  eleventyConfig.addCollection("searchPosts", (collectionApi) => {
    const siteOrder = [...featured, ...artifactOrder];
    return collectionApi.getFilteredByTag("posts")
      .sort((a, b) => {
        const ia = siteOrder.indexOf(a.fileSlug);
        const ib = siteOrder.indexOf(b.fileSlug);
        if (ia !== -1 && ib !== -1) return ia - ib;
        const byDate = b.date - a.date;
        if (byDate !== 0) return byDate;
        return ia === -1 ? 1 : -1;
      });
  });
  eleventyConfig.addGlobalData("cssHash", cssHash);
  eleventyConfig.addFilter("rssDate", (date) => {
    return new Date(date).toUTCString();
  });
  // Make root-relative URLs in feed content absolute, so feed readers
  // resolve post links and images against the live site.
  eleventyConfig.addFilter("absoluteUrls", (html) => {
    return String(html)
      .replaceAll('href="/', 'href="https://raihanlite.github.io/sock-guide/')
      .replaceAll('src="/', 'src="https://raihanlite.github.io/sock-guide/');
  });
  eleventyConfig.addFilter("readableDate", (date) => {
    return new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
  });
  eleventyConfig.addFilter("isoDate", (date) => {
    return new Date(date).toISOString().slice(0, 10);
  });
  // Artifact date display: month-only ("November 2026") for every article
  // except the Christmas gift guide and the running guide, which show
  // their full dates ("23 November 2026"). Display-only: underlying post
  // dates are untouched.
  eleventyConfig.addFilter("displayDate", (date, slug) => {
    if (slug === "best-socks-for-christmas-gifts" || slug === "best-running-socks" || slug === "what-are-socks-why-do-we-wear-socks" || slug === "types-of-socks" || slug === "best-socks-for-sweaty-feet" || slug === "how-to-take-care-of-socks" || slug === "best-merino-wool-socks" || slug === "history-of-socks" || slug === "best-heated-socks" || slug === "how-socks-are-made" || slug === "what-are-compression-socks-used-for" || slug === "how-long-can-you-wear-compression-socks" || slug === "how-to-knit-a-sock" || slug === "sock-fabrics" || slug === "best-socks-for-men" || slug === "best-socks-for-women" || slug === "best-everyday-socks" || slug === "best-football-socks" || slug === "best-basketball-socks" || slug === "best-socks-for-school" || slug === "best-compression-socks-for-nurses") {
      return "23 November 2026";
    }
    return new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "long" });
  });
  // Safety net for root-relative URLs written directly in post bodies
  // (raw <img> tags in Markdown): prefix them with the pathPrefix so they
  // resolve under /sock-guide/ on GitHub Pages. URLs already prefixed are
  // left untouched.
  eleventyConfig.addTransform("prefixUrls", function (content) {
    if (!this.page || !this.page.outputPath || !this.page.outputPath.endsWith(".html")) {
      return content;
    }
    return content
      .replace(/(src|href)="\/(?!sock-guide\/)/g, '$1="/sock-guide/')
      .replace(/(src|href)='\/((?!sock-guide\/))/g, "$1='/sock-guide/$2");
  });
  // FAQPage JSON-LD: posts carry their FAQs as
  // <details class="faq"><summary>Q</summary><div class="a">A</div></details>.
  // Extract the pairs from the rendered HTML, strip tags to plain text,
  // and inject a valid FAQPage script before </body>. Post pages only;
  // pages without FAQ blocks are left untouched.
  eleventyConfig.addTransform("faqJsonLd", function (content) {
    if (!this.page || !this.page.outputPath || !this.page.outputPath.endsWith(".html")) {
      return content;
    }
    if (!(this.page.inputPath || "").includes("/posts/")) {
      return content;
    }
    const faqs = [];
    const re = /<details class="faq">\s*<summary>([\s\S]*?)<\/summary>\s*<div class="a">([\s\S]*?)<\/div>\s*<\/details>/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const q = stripTags(m[1]).trim().replace(/\s+/g, " ");
      const a = stripTags(m[2]).trim().replace(/\s+/g, " ");
      if (q && a) {
        faqs.push({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        });
      }
    }
    if (!faqs.length) return content;
    const json = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs,
    });
    return content.replace(
      "</body>",
      `<script type="application/ld+json">${json}</script>\n</body>`
    );
  });
  // Responsive template images: {% respImg src, alt, "preset" %} renders a
  // <picture> with WebP + JPEG srcsets. Presets: hero, articleHero, card,
  // catCard, thumb (see IMG_PRESETS).
  eleventyConfig.addNunjucksAsyncShortcode("respImg", responsiveImage);
  // Pick photos: the 17 product posts carry raw <img> tags in their
  // Markdown. Rewrite them to responsive <picture> markup (WebP + the
  // original format, widths 400/800, width/height from the source file),
  // keeping the existing alt text and eager loading. Hero images are
  // already <picture> markup from the shortcode (their srcs carry a
  // "-<width>w." suffix) and are left alone; so are images outside posts.
  eleventyConfig.addTransform("pickImages", async function (content) {
    if (!this.page || !this.page.outputPath || !this.page.outputPath.endsWith(".html")) {
      return content;
    }
    if (!(this.page.inputPath || "").includes("/posts/")) {
      return content;
    }
    const re = /<img\s[^>]*?src="((?:\/sock-guide)?\/img\/(?:artifact|picks)\/([^"]+?))"[^>]*?>/g;
    const matches = [...content.matchAll(re)];
    if (!matches.length) return content;
    let out = content;
    for (const m of matches) {
      const [tag, src, basename] = m;
      if (/-\d+w\./.test(basename)) continue; // already a generated file
      const altMatch = tag.match(/alt="([^"]*)"/);
      const alt = altMatch ? altMatch[1] : "";
      const ext = (basename.split(".").pop() || "jpeg").toLowerCase();
      const origFormat = ext === "jpg" ? "jpeg" : ext;
      const formats = origFormat === "webp" ? ["webp"] : ["webp", origFormat];
      const srcPath = path.join("src", src.replace(/^\/(sock-guide\/)?/, ""));
      try {
        const metadata = await Image(srcPath, {
          widths: [400, 800],
          formats,
          urlPath: IMG_URL_PATH,
          outputDir: IMG_OUTPUT_DIR,
          filenameFormat: (id, src, width, format) => {
            const name = path.basename(src, path.extname(src));
            return `${name}-${width}w.${format}`;
          },
        });
        const html = Image.generateHTML(metadata, {
          alt,
          sizes: "(max-width: 720px) 100vw, 680px",
          decoding: "async",
        });
        out = out.replace(tag, html);
      } catch (e) {
        console.warn(`[pickImages] could not optimize ${src}: ${e.message}`);
      }
    }
    return out;
  });
  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    pathPrefix: "/sock-guide/",
  };
}
