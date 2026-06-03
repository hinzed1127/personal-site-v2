import markdownItLinkAttributes from "markdown-it-link-attributes";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import anchor from "markdown-it-anchor";
import feedPlugin from "@11ty/eleventy-plugin-rss";
import footnote from "markdown-it-footnote";
import Shiki from "markdown-it-shiki";

export default function (config) {
  const isProduction = process.env.ELEVENTY_ENV === "production";

  config.addGlobalData("isDev", !isProduction);

  config.addFilter("hostname", url => new URL(url).hostname);
  config.addFilter("displayTags", tags => (tags ?? []).filter(t => t !== "post"));

  config.addCollection("links", collectionApi => {
    return collectionApi.getFilteredByGlob("links/*.md").sort((a, b) => b.date - a.date);
  });

  config.addCollection("listening", collectionApi => {
    return collectionApi.getFilteredByTag("listening").sort((a, b) => b.date - a.date);
  });

  config.addCollection("posts", collectionApi => {
    return collectionApi.getFilteredByTag("post").filter(post => {
      return isProduction ? !post.data.draft : true;
    });
  });

  config.addGlobalData("eleventyComputed", {
    permalink: data => {
      if (isProduction && data.draft) {
        return false;
      }
      return data.permalink;
    },
  });

  config.addPassthroughCopy("styles.css");
  config.addPassthroughCopy("images");
  config.addPassthroughCopy("files");
  config.addPassthroughCopy({
    "node_modules/lite-youtube-embed/src/lite-yt-embed.css": "vendor/lite-yt-embed.css",
    "node_modules/lite-youtube-embed/src/lite-yt-embed.js": "vendor/lite-yt-embed.js",
  });
  config.addPassthroughCopy({ "listening-client.js": "vendor/listening-client.js" });
  config.addPassthroughCopy({ "footnotes.js": "vendor/footnotes.js" });

  config.addShortcode("youtube", videoId => {
    return `<lite-youtube videoid="${videoId}">
  <a href="https://youtube.com/watch?v=${videoId}" class="lyt-playbtn" title="Play Video">
    <span class="lyt-visually-hidden">Play Video</span>
  </a>
</lite-youtube>`;
  });

  config.addTransform("youtube-assets", (content, outputPath) => {
    if (typeof outputPath !== "string" || !outputPath.endsWith(".html")) return content;
    if (!content.includes("<lite-youtube")) return content;

    content = content.replace("</head>", `  <link rel="stylesheet" href="/vendor/lite-yt-embed.css">\n</head>`);
    content = content.replace("</body>", `  <script defer src="/vendor/lite-yt-embed.js"></script>\n</body>`);

    return content;
  });

  config.addTransform("footnotes-assets", (content, outputPath) => {
    if (typeof outputPath !== "string" || !outputPath.endsWith(".html")) return content;
    if (!content.includes('class="footnote-ref"')) return content;

    return content.replace("</body>", `  <script type="module" src="/vendor/footnotes.js"></script>\n</body>`);
  });

  const markdownItLinkAttributesOptions = {
    matcher(href) {
      return href.match(/^https?:\/\//) || href.match(/\.pdf$/i);
    },
    attrs: {
      target: "_blank",
      rel: "noopener",
    },
  };
  config.amendLibrary("md", mdLib => mdLib.use(Shiki, { theme: "github-dark" }));
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
    }),
  );

  config.amendLibrary("md", mdLib => {
    mdLib.use(footnote);

    mdLib.renderer.rules["footnote_ref"] = (tokens, idx, options, env, slf) => {
      const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
      let refid = id;
      if (tokens[idx].meta.subId > 0) refid += `:${tokens[idx].meta.subId}`;
      return `<sup class="footnote-ref" id="fnref${refid}"><a href="#fn${id}" class="footnote-trigger" aria-label="Footnote ${id}" aria-details="fn-popover-${id}" interesttarget="fn-popover-${id}">${id}</a></sup>`;
    };

    mdLib.renderer.rules["footnote_open"] = (tokens, idx, options, env, slf) => {
      const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
      return `<div id="fn-popover-${id}" popover role="note" class="footnote-popover"></div>\n<li id="fn${id}"><a href="#fnref${id}" class="footnote-number">${id}</a> `;
    };

    mdLib.renderer.rules["footnote_anchor"] = () => "";
  });

  config.addPlugin(eleventyImageTransformPlugin);

  config.addPlugin(feedPlugin);

  // TODO: Footnote HTML lands in the RSS feed as-is. Follow up to decide the best
  // approach for RSS readers (e.g., strip popovers, inline parentheticals, or keep HTML).
  // See also: https://github.com/hinzed1127/personal-site-v2/issues/6

  // Filter to replace lite-youtube embeds with plain links for RSS feed
  config.addFilter("youtubeToLinks", content => {
    if (!content) return content;
    return content.replace(
      /<lite-youtube videoid="([^"]+)"[\s\S]*?<\/lite-youtube>/g,
      '<p><a href="https://youtube.com/watch?v=$1">Watch on YouTube</a></p>',
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
