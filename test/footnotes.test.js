import { describe, it, expect, beforeAll } from "vitest";
import Eleventy from "@11ty/eleventy";

async function build() {
  const elev = new Eleventy("./", "./_site", { quietMode: true });
  return await elev.toJSON();
}

function findByUrl(results, url) {
  return results.find((r) => r.url === url);
}

describe("footnotes", () => {
  let results;
  let post;

  beforeAll(async () => {
    results = await build();
    post = findByUrl(results, "/posts/pulling-weeds-and-planting-seeds/");
  });

  describe("render overrides", () => {
    it("renders footnote ref as a sup with a trigger button", () => {
      expect(post.content).toContain('class="footnote-ref"');
      expect(post.content).toContain('class="footnote-trigger"');
    });

    it("renders the trigger as a link with interest invoker", () => {
      expect(post.content).toContain('href="#fn1"');
      expect(post.content).toContain('interesttarget="fn-popover-1"');
      expect(post.content).not.toContain('popovertarget="fn-popover-1"');
    });

    it("renders the trigger button with aria-label", () => {
      expect(post.content).toContain('aria-label="Footnote 1"');
    });

    it("renders the trigger button with aria-details", () => {
      expect(post.content).toContain('aria-details="fn-popover-1"');
    });

    it("renders the popover div for each footnote", () => {
      expect(post.content).toContain('id="fn-popover-1"');
      expect(post.content).toContain('popover');
      expect(post.content).toContain('role="note"');
      expect(post.content).toContain('class="footnote-popover"');
    });

    it("renders the traditional list item for each footnote", () => {
      expect(post.content).toContain('id="fn1"');
    });

    it("renders a numbered link in the list item instead of a backref arrow", () => {
      expect(post.content).toContain('class="footnote-number"');
      expect(post.content).not.toContain('class="footnote-backref"');
    });

    it("renders multiple footnotes", () => {
      expect(post.content).toContain('aria-details="fn-popover-2"');
      expect(post.content).toContain('aria-details="fn-popover-3"');
      expect(post.content).toContain('aria-details="fn-popover-4"');
    });
  });

  describe("script injection", () => {
    it("injects footnotes.js on pages with footnotes", () => {
      expect(post.content).toContain('<script type="module" src="/vendor/footnotes.js"></script>');
    });

    it("does not inject footnotes.js on pages without footnotes", () => {
      const about = findByUrl(results, "/about/");
      expect(about.content).not.toContain("footnotes.js");
    });
  });
});
