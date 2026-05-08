import { describe, it, expect } from "vitest";
import Eleventy from "@11ty/eleventy";

async function build() {
  const elev = new Eleventy("./", "./_site", { quietMode: true });
  return await elev.toJSON();
}

function findByUrl(results, url) {
  return results.find(r => r.url === url);
}

describe("links page", () => {
  it("renders the /links/ route", async () => {
    const results = await build();
    const page = findByUrl(results, "/links/");
    expect(page).toBeDefined();
  });

  it("includes a Links nav link in the base layout", async () => {
    const results = await build();
    const page = findByUrl(results, "/links/");
    expect(page.content).toContain('href="/links/"');
  });

  it("renders individual link pages under /links/", async () => {
    const results = await build();
    const linkPages = results.filter(
      r => r.url.startsWith("/links/") && r.url !== "/links/"
    );
    expect(linkPages.length).toBeGreaterThan(0);
  });

  it("individual link pages include the external link", async () => {
    const results = await build();
    const linkPages = results.filter(
      r => r.url.startsWith("/links/") && r.url !== "/links/"
    );
    for (const page of linkPages) {
      expect(page.content).toMatch(/href="https?:\/\//);
    }
  });

  it("index page lists link titles linking to individual pages", async () => {
    const results = await build();
    const index = findByUrl(results, "/links/");
    const linkPages = results.filter(
      r => r.url.startsWith("/links/") && r.url !== "/links/"
    );
    for (const page of linkPages) {
      expect(index.content).toContain(`href="${page.url}"`);
    }
  });
});
