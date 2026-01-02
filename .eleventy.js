import markdownItLinkAttributes from "markdown-it-link-attributes";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import feedPlugin from "@11ty/eleventy-plugin-rss";

export default function (config) {
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

  config.addPlugin(eleventyImageTransformPlugin);

  config.addPlugin(feedPlugin);
}
