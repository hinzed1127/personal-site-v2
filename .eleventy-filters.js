/**
 * Parses rendered HTML body of a link collection entry into a map.
 * Keys: "" for intro content before first <h3>, and each h3 heading text.
 * Values: trimmed HTML content following each heading.
 */
export function parseLinkSections(html) {
  if (!html) return { "": "" };

  // Split on opening of any h3 tag
  const parts = html.split(/(?=<h3)/);
  const result = {};

  // First part is the intro (before any h3); strip trailing header-wrapper div if present
  const intro = parts[0].replace(/\s*<div class="header-wrapper">\s*$/, "").trim();
  result[""] = intro;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    // Extract heading text: content of <h3>...</h3>, stripping the anchor link
    const headingMatch = part.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
    if (!headingMatch) continue;
    // Strip any child elements (including their text content) to get plain text
    const headingText = headingMatch[1].replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, "").replace(/<[^>]+>/g, "").trim();
    // Content is everything after the closing </h3>.
    // markdown-it-anchor (linkAfterHeader mode) places <a class="header-anchor"> between
    // </h3> and the closing </div> of the wrapper — strip both before returning content.
    const afterHeading = part.slice(part.indexOf("</h3>") + 5);
    const content = afterHeading
      .replace(/^\s*<a class="header-anchor"[^>]*>[\s\S]*?<\/a>\s*/, "")
      .replace(/^\s*<\/div>\s*/, "")
      .replace(/\s*<div class="header-wrapper">\s*$/, "")
      .trim();
    result[headingText] = content;
  }

  return result;
}
