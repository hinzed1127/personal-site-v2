import markdownItLinkAttributes from "markdown-it-link-attributes";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import anchor from "markdown-it-anchor";
import feedPlugin from "@11ty/eleventy-plugin-rss";
import { groupPhotoStacks } from "./transforms/photo-stack-group.js";

export default function (config) {
  const isProduction = process.env.ELEVENTY_ENV === "production";

  config.addGlobalData("isDev", !isProduction);

  config.addCollection("posts", (collectionApi) => {
    return collectionApi.getFilteredByTag("post").filter((post) => {
      return isProduction ? !post.data.draft : true;
    });
  });

  config.addGlobalData("eleventyComputed", {
    permalink: (data) => {
      if (isProduction && data.draft) {
        return false;
      }
      return data.permalink;
    },
  });

  config.addPassthroughCopy("styles.css");
  config.addPassthroughCopy("images");
  config.addPassthroughCopy({
    "node_modules/lite-youtube-embed/src/lite-yt-embed.css": "vendor/lite-yt-embed.css",
    "node_modules/lite-youtube-embed/src/lite-yt-embed.js": "vendor/lite-yt-embed.js",
  });

  config.addShortcode("youtube", (videoId) => {
    return `<lite-youtube videoid="${videoId}">
  <a href="https://youtube.com/watch?v=${videoId}" class="lyt-playbtn" title="Play Video">
    <span class="lyt-visually-hidden">Play Video</span>
  </a>
</lite-youtube>`;
  });

  config.addTransform("youtube-assets", (content, outputPath) => {
    if (typeof outputPath !== "string" || !outputPath.endsWith(".html")) return content;
    if (!content.includes("<lite-youtube")) return content;

    content = content.replace(
      "</head>",
      `  <link rel="stylesheet" href="/vendor/lite-yt-embed.css">\n</head>`
    );
    content = content.replace(
      "</body>",
      `  <script defer src="/vendor/lite-yt-embed.js"></script>\n</body>`
    );

    return content;
  });

  config.addTransform("photo-stack-group", groupPhotoStacks);

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

  // Filter to replace lite-youtube embeds with plain links for RSS feed
  config.addFilter("youtubeToLinks", content => {
    if (!content) return content;
    return content.replace(
      /<lite-youtube videoid="([^"]+)"[\s\S]*?<\/lite-youtube>/g,
      '<p><a href="https://youtube.com/watch?v=$1">Watch on YouTube</a></p>'
    );
  });

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
