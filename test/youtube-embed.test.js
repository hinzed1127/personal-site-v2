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
});
