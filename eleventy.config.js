export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/img");
  // Latest Posts: all posts newest-first, excluding the 4 featured on the
  // homepage (hero + 3 cards) so they do not repeat in the list.
  // Compare fileSlug, not url: page.url already includes the pathPrefix.
  eleventyConfig.addCollection("latestPosts", (collectionApi) => {
    const featured = [
      "best-work-socks",
      "best-socks-for-work-boots",
      "best-alpaca-socks",
      "best-heated-socks-for-hunting",
    ];
    return collectionApi.getFilteredByTag("posts").filter((p) => !featured.includes(p.fileSlug)).reverse();
  });
  eleventyConfig.addFilter("readableDate", (date) => {
    return new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
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
