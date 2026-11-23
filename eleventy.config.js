export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/img");
  // Latest Posts: all posts newest-first, excluding the 4 featured on the
  // homepage (hero + 3 cards) so they do not repeat in the list.
  eleventyConfig.addCollection("latestPosts", (collectionApi) => {
    const featured = [
      "/posts/best-work-socks/",
      "/posts/best-socks-for-work-boots/",
      "/posts/best-alpaca-socks/",
      "/posts/best-heated-socks-for-hunting/",
    ];
    return collectionApi.getFilteredByTag("posts").filter((p) => !featured.includes(p.url)).reverse();
  });
  eleventyConfig.addFilter("readableDate", (date) => {
    return new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
  });
  return { dir: { input: "src", output: "_site", includes: "_includes", data: "_data" } };
}
