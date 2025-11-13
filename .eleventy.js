import markdownItLinkAttributes from "markdown-it-link-attributes";

export default function (config) {
  config.addPassthroughCopy("styles.css");

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
}
