/**
 * Detects consecutive <p> tags containing only <picture> elements
 * and wraps them in a .photo-stack container.
 */
const SINGLE_IMAGE_P_PATTERN = /<p>\s*(<picture[\s\S]*?<\/picture>)\s*<\/p>/;
const MULTI_IMAGE_P_PATTERN = /^<p>\s*((?:<picture[\s\S]*?<\/picture>\s*)+)<\/p>$/;
const PICTURE_PATTERN = /<picture[\s\S]*?<\/picture>/g;

function extractPictures(block) {
  const multiMatch = block.match(MULTI_IMAGE_P_PATTERN);
  if (multiMatch) {
    return [...multiMatch[1].matchAll(PICTURE_PATTERN)].map((m) => m[0]);
  }
  return null;
}

export function groupPhotoStacks(content, outputPath) {
  if (typeof outputPath !== "string" || !outputPath.endsWith(".html")) return content;

  const lines = content.split("\n");
  const result = [];
  let group = [];
  let pendingBlock = null;

  function flushGroup() {
    if (group.length >= 2) {
      result.push('<div class="photo-stack">');
      group.forEach((pictureHtml, i) => {
        result.push(`<div class="photo-stack-item" style="--i: ${i}">${pictureHtml}</div>`);
      });
      result.push("</div>");
    } else if (group.length === 1) {
      result.push(`<p>${group[0]}</p>`);
    }
    group = [];
  }

  function flushPending() {
    if (pendingBlock !== null) {
      // The accumulated block didn't end up matching; emit lines as-is
      flushGroup();
      for (const line of pendingBlock) {
        result.push(line);
      }
      pendingBlock = null;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // If we're accumulating a multi-line <p> block
    if (pendingBlock !== null) {
      pendingBlock.push(line);
      if (trimmed.endsWith("</p>")) {
        const block = pendingBlock.map((l) => l.trim()).join("\n");
        const pictures = extractPictures(block);
        if (pictures) {
          group.push(...pictures);
        } else {
          flushPending();
        }
        pendingBlock = null;
      }
      continue;
    }

    // Skip blank lines while collecting a group
    if (trimmed === "" && group.length > 0) continue;

    // Check for a <p> that opens but doesn't close on this line
    if (trimmed.startsWith("<p>") && !trimmed.includes("</p>")) {
      pendingBlock = [line];
      continue;
    }

    const match = trimmed.match(SINGLE_IMAGE_P_PATTERN);
    if (match) {
      group.push(match[1]);
    } else {
      // Also try multi-image on a single line
      const pictures = extractPictures(trimmed);
      if (pictures) {
        group.push(...pictures);
      } else {
        flushGroup();
        result.push(line);
      }
    }
  }
  flushPending();
  flushGroup();

  let output = result.join("\n");

  if (output.includes("photo-stack")) {
    output = output.replace(
      "</body>",
      `  <script defer src="/vendor/photo-stack.js"></script>\n</body>`
    );
  }

  return output;
}
