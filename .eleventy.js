import markdownItLinkAttributes from "markdown-it-link-attributes";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import anchor from "markdown-it-anchor";
import feedPlugin from "@11ty/eleventy-plugin-rss";

export default function (config) {
  const isProduction = process.env.ELEVENTY_ENV === "production";

  config.addGlobalData("isDev", !isProduction);

  config.addCollection("posts", (collectionApi) => {
    return collectionApi.getFilteredByTag("post").filter((post) => {
      return isProduction ? !post.data.draft : true;
    });
  });

  config.addPassthroughCopy("styles.css");
  config.addPassthroughCopy("images");

  const markdownItLinkAttributesOptions = {
    matcher(href) {
      return href.match(/^https?:\/\//);
    },
    attrs: {
      target: "_blank",
      rel: "noopener",
    },
  };
  config.amendLibrary("md", mdLib => mdLib.use(markdownItLinkAttributes, markdownItLinkAttributesOptions));
  config.amendLibrary("md", mdLib =>
    mdLib.use(anchor, {
      permalink: anchor.permalink.linkAfterHeader({
        class: "header-anchor",
        symbol: "🔗",
        style: "aria-label",
        assistiveText: title => `Permalink to "${title}" heading`,
        wrapper: ['<div class="header-wrapper">', "</div>"],
      }),
    })
  );

  config.addPlugin(eleventyImageTransformPlugin);

  config.addPlugin(feedPlugin);

  // Filter to strip anchor links from RSS feed
  config.addFilter("stripAnchorLinks", content => {
    if (!content) return content;

    return (
      content
        // Remove anchor link elements with the 🔗 emoji
        .replace(/<a class="header-anchor"[^>]*>.*?<\/a>/g, "")
        // Remove header-wrapper divs but keep their content
        .replace(/<div class="header-wrapper">\s*/g, "")
        .replace(/\s*<\/div>/g, "")
    );
  });
}
