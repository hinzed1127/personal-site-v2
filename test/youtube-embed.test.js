import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Eleventy from "@11ty/eleventy";
import fs from "fs";
import path from "path";

const outputDir = "./_site-test-vendor";

async function buildToFilesystem(env = "") {
  const prevEnv = process.env.ELEVENTY_ENV;
  process.env.ELEVENTY_ENV = env;

  try {
    const elev = new Eleventy("./", outputDir, {
      quietMode: true,
    });

    await elev.write();
  } finally {
    if (prevEnv === undefined) {
      delete process.env.ELEVENTY_ENV;
    } else {
      process.env.ELEVENTY_ENV = prevEnv;
    }
  }
}

async function build(env = "") {
  const prevEnv = process.env.ELEVENTY_ENV;
  process.env.ELEVENTY_ENV = env;
  try {
    const elev = new Eleventy("./", "./_site", { quietMode: true });
    const results = await elev.toJSON();
    return results;
  } finally {
    if (prevEnv === undefined) {
      delete process.env.ELEVENTY_ENV;
    } else {
      process.env.ELEVENTY_ENV = prevEnv;
    }
  }
}

function findByUrl(results, url) {
  return results.find((r) => r.url === url);
}

describe("youtube embed", () => {
  describe("vendor assets", () => {
    beforeAll(async () => {
      await buildToFilesystem();
    });

    afterAll(() => {
      fs.rmSync(outputDir, { recursive: true, force: true });
    });

    it("copies lite-yt-embed.css to /vendor/", () => {
      const cssPath = path.join(outputDir, "vendor", "lite-yt-embed.css");
      expect(fs.existsSync(cssPath)).toBe(true);
    });

    it("copies lite-yt-embed.js to /vendor/", () => {
      const jsPath = path.join(outputDir, "vendor", "lite-yt-embed.js");
      expect(fs.existsSync(jsPath)).toBe(true);
    });
  });

  describe("transform", () => {
    it("injects lite-yt-embed.css on pages with youtube embeds", async () => {
      const results = await build();
      const post = findByUrl(
        results,
        "/posts/regular-reflections-3-a-terrible-horrible-no-good-very-bad-month/"
      );
      expect(post.content).toContain(
        '<link rel="stylesheet" href="/vendor/lite-yt-embed.css">'
      );
    });

    it("injects lite-yt-embed.js on pages with youtube embeds", async () => {
      const results = await build();
      const post = findByUrl(
        results,
        "/posts/regular-reflections-3-a-terrible-horrible-no-good-very-bad-month/"
      );
      expect(post.content).toContain(
        '<script defer src="/vendor/lite-yt-embed.js"></script>'
      );
    });

    it("does not inject assets on pages without youtube embeds", async () => {
      const results = await build();
      const aboutPage = findByUrl(results, "/about/");
      expect(aboutPage.content).not.toContain("lite-yt-embed");
    });
  });

  describe("shortcode", () => {
    it("renders a lite-youtube element with the given video ID", async () => {
      const results = await build();
      const post = findByUrl(
        results,
        "/posts/regular-reflections-3-a-terrible-horrible-no-good-very-bad-month/"
      );
      expect(post.content).toContain('<lite-youtube videoid="DfTBhrkae74">');
    });

    it("includes a fallback play button link", async () => {
      const results = await build();
      const post = findByUrl(
        results,
        "/posts/regular-reflections-3-a-terrible-horrible-no-good-very-bad-month/"
      );
      expect(post.content).toContain(
        'href="https://youtube.com/watch?v=DfTBhrkae74"'
      );
      expect(post.content).toContain('class="lyt-playbtn"');
    });
  });
});
