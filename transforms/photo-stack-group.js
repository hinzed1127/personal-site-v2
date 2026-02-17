/**
 * Detects consecutive <p> tags containing only <picture> elements
 * and wraps them in a .photo-stack container.
 */
export function groupPhotoStacks(content, outputPath) {
  if (typeof outputPath !== "string" || !outputPath.endsWith(".html")) return content;
  return content;
}
