/**
 * Detects consecutive <p> tags containing only <picture> elements
 * and wraps them in a .photo-stack container.
 */
const IMAGE_P_PATTERN = /<p>\s*(<picture[\s\S]*?<\/picture>)\s*<\/p>/;

export function groupPhotoStacks(content, outputPath) {
  if (typeof outputPath !== "string" || !outputPath.endsWith(".html")) return content;

  const lines = content.split("\n");
  const result = [];
  let group = [];

  function flushGroup() {
    if (group.length >= 1) {
      result.push('<div class="photo-stack">');
      group.forEach((pictureHtml, i) => {
        result.push(`<div class="photo-stack-item" style="--i: ${i}">${pictureHtml}</div>`);
      });
      result.push("</div>");
    }
    group = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip blank lines while collecting a group
    if (trimmed === "" && group.length > 0) continue;

    const match = trimmed.match(IMAGE_P_PATTERN);
    if (match) {
      group.push(match[1]);
    } else {
      flushGroup();
      result.push(line);
    }
  }
  flushGroup();

  return result.join("\n");
}
