import { describe, it, expect } from "vitest";
import Eleventy from "@11ty/eleventy";
import { parseLinkSections } from "../.eleventy-filters.js";

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

  it("renders link collection pages with all sub-link titles", async () => {
    const results = await build();
    const collectionPage = results.find(
      r => r.url.startsWith("/links/") && r.url !== "/links/" && r.content.includes("Some Test Article")
    );
    expect(collectionPage).toBeDefined();
    expect(collectionPage.content).toContain("Another Test Article");
    expect(collectionPage.content).toContain("example.com");
  });

  it("renders intro content before sub-links in a collection", async () => {
    const results = await build();
    const collectionPage = results.find(
      r => r.url.startsWith("/links/") && r.url !== "/links/" && r.content.includes("Some Test Article")
    );
    expect(collectionPage.content).toContain("Test intro paragraph");
  });
});

describe("parseLinkSections filter", () => {
  it("returns empty string intro and empty map when body has no h3s", () => {
    const html = "<p>Just an intro.</p>";
    const result = parseLinkSections(html);
    expect(result[""]).toBe("<p>Just an intro.</p>");
    expect(Object.keys(result).length).toBe(1);
  });

  it("maps h3 heading text to following content", () => {
    const html = `<p>Intro.</p>\n<div class="header-wrapper">\n<h3>Some Article<a class="header-anchor" href="#some-article">🔗</a></h3></div><p>Commentary here.</p>\n<div class="header-wrapper">\n<h3>Another Thing<a class="header-anchor" href="#another-thing">🔗</a></h3></div><p>More notes.</p>`;
    const result = parseLinkSections(html);
    expect(result[""]).toBe("<p>Intro.</p>");
    expect(result["Some Article"]).toBe('<p>Commentary here.</p>');
    expect(result["Another Thing"]).toBe('<p>More notes.</p>');
  });

  it("returns empty intro for null/undefined input", () => {
    expect(parseLinkSections(null)[""]).toBe("");
    expect(parseLinkSections(undefined)[""]).toBe("");
  });

  it("returns empty string for a link title with no commentary", () => {
    const html = `<p>Intro.</p><div class="header-wrapper"><h3>No Commentary<a class="header-anchor" href="#no-commentary">🔗</a></h3></div><div class="header-wrapper"><h3>Has Commentary<a class="header-anchor" href="#has-commentary">🔗</a></h3></div><p>Text.</p>`;
    const result = parseLinkSections(html);
    expect(result["No Commentary"]).toBe("");
    expect(result["Has Commentary"]).toBe("<p>Text.</p>");
  });
});
