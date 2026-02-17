import { describe, it, expect } from "vitest";
import { groupPhotoStacks } from "../transforms/photo-stack-group.js";

describe("groupPhotoStacks", () => {
  const pic = (alt = "test") =>
    `<picture><source type="image/webp" srcset="/img/test.webp 800w"><img src="/img/test.jpeg" alt="${alt}" width="800" height="600"></picture>`;

  it("wraps 2 consecutive image paragraphs in a photo-stack container", () => {
    const input = `<p>${pic("one")}</p>\n<p>${pic("two")}</p>`;
    const result = groupPhotoStacks(input, "/posts/test/index.html");

    expect(result).toContain('<div class="photo-stack">');
    expect(result).toContain('class="photo-stack-item"');
    expect(result).not.toContain("<p>");
  });

  it("wraps 3 consecutive image paragraphs in a photo-stack container", () => {
    const input = `<p>${pic("one")}</p>\n<p>${pic("two")}</p>\n<p>${pic("three")}</p>`;
    const result = groupPhotoStacks(input, "/posts/test/index.html");

    expect(result).toContain('<div class="photo-stack">');
    const itemCount = (result.match(/photo-stack-item/g) || []).length;
    expect(itemCount).toBe(3);
  });

  it("assigns incrementing --i custom property to each item", () => {
    const input = `<p>${pic("one")}</p>\n<p>${pic("two")}</p>\n<p>${pic("three")}</p>`;
    const result = groupPhotoStacks(input, "/posts/test/index.html");

    expect(result).toContain('style="--i: 0"');
    expect(result).toContain('style="--i: 1"');
    expect(result).toContain('style="--i: 2"');
  });

  it("wraps a single image paragraph in a photo-stack container", () => {
    const input = `<p>Some text</p>\n<p>${pic()}</p>\n<p>More text</p>`;
    const result = groupPhotoStacks(input, "/posts/test/index.html");

    expect(result).toContain('<div class="photo-stack">');
    const itemCount = (result.match(/photo-stack-item/g) || []).length;
    expect(itemCount).toBe(1);
  });

  it("returns content unchanged for non-HTML files", () => {
    const input = `<p>${pic()}</p>\n<p>${pic()}</p>`;
    const result = groupPhotoStacks(input, "/feed.xml");
    expect(result).toBe(input);
  });

  it("preserves content around photo stacks", () => {
    const input = `<p>Before</p>\n<p>${pic("one")}</p>\n<p>${pic("two")}</p>\n<p>After</p>`;
    const result = groupPhotoStacks(input, "/posts/test/index.html");

    expect(result).toContain("<p>Before</p>");
    expect(result).toContain("<p>After</p>");
    expect(result).toContain('<div class="photo-stack">');
  });

  it("handles multiple separate groups in one page", () => {
    const input = [
      `<p>${pic("a1")}</p>`, `<p>${pic("a2")}</p>`,
      `<p>text between</p>`,
      `<p>${pic("b1")}</p>`, `<p>${pic("b2")}</p>`, `<p>${pic("b3")}</p>`,
    ].join("\n");
    const result = groupPhotoStacks(input, "/posts/test/index.html");

    const stackCount = (result.match(/class="photo-stack"/g) || []).length;
    expect(stackCount).toBe(2);
  });

  it("handles whitespace between consecutive image paragraphs", () => {
    const input = `<p>${pic("one")}</p>\n\n<p>${pic("two")}</p>`;
    const result = groupPhotoStacks(input, "/posts/test/index.html");
    expect(result).toContain('<div class="photo-stack">');
  });
});
