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
});
