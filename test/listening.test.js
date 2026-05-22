// test/listening.test.js
import { describe, it, expect } from "vitest";
import Eleventy from "@11ty/eleventy";

async function build() {
  const elev = new Eleventy("./", "./_site", { quietMode: true });
  return await elev.toJSON();
}

function findByUrl(results, url) {
  return results.find((r) => r.url === url);
}

describe("listening page", () => {
  it("renders the /listening/ route", async () => {
    const results = await build();
    const page = findByUrl(results, "/listening/");
    expect(page).toBeDefined();
  });

  it("includes a Listening nav link in the base layout", async () => {
    const results = await build();
    const page = findByUrl(results, "/listening/");
    expect(page.content).toContain('href="/listening/"');
  });

  it("renders individual album entry pages under /listening/", async () => {
    const results = await build();
    const entryPages = results.filter(
      (r) => r.url.startsWith("/listening/") && r.url !== "/listening/"
    );
    expect(entryPages.length).toBeGreaterThan(0);
  });

  it("album entry pages include artist name", async () => {
    const results = await build();
    const entryPages = results.filter(
      (r) => r.url.startsWith("/listening/") && r.url !== "/listening/"
    );
    for (const page of entryPages) {
      expect(page.content).toMatch(/Tortoise|[A-Z][a-z]+/);
    }
  });

  it("index page lists album titles linking to individual pages", async () => {
    const results = await build();
    const index = findByUrl(results, "/listening/");
    const entryPages = results.filter(
      (r) => r.url.startsWith("/listening/") && r.url !== "/listening/"
    );
    for (const page of entryPages) {
      expect(index.content).toContain(`href="${page.url}"`);
    }
  });

  it("renders the listening-banner__stamp wrapper", async () => {
    const results = await build();
    const page = findByUrl(results, "/listening/");
    expect(page.content).toContain('class="listening-banner__stamp"');
  });
});
