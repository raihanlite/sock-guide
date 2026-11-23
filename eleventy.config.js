export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/sitemap.xml");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  // YYYY-MM-DD for Article JSON-LD datePublished (front matter date).
  // Latest Posts: all posts newest-first, excluding the 4 featured on the
  // homepage (hero + 3 cards) so they do not repeat in the list.
  // Compare fileSlug, not url: page.url already includes the pathPrefix.
  // Several guides share one publish month and the artifact's order is
  // not date order (see below), so the artifact's order is applied
  // explicitly to keep Latest Posts identical to the artifact.
  eleventyConfig.addCollection("latestPosts", (collectionApi) => {
    const featured = [
      "best-work-socks",
      "best-socks-for-work-boots",
      "best-alpaca-socks",
      "best-heated-socks-for-hunting",
    ];
    const artifactOrder = [
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
    if (slug === "best-socks-for-christmas-gifts" || slug === "best-running-socks" || slug === "what-are-socks-why-do-we-wear-socks" || slug === "types-of-socks" || slug === "best-socks-for-sweaty-feet") {
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
  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    pathPrefix: "/sock-guide/",
  };
}
