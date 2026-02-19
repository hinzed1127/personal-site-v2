import { describe, it, expect } from "vitest";
import Eleventy from "@11ty/eleventy";

async function build(env = "") {
  const prevEnv = process.env.ELEVENTY_ENV;
  process.env.ELEVENTY_ENV = env;

  try {
    const elev = new Eleventy("./", "./_site", {
      quietMode: true,
    });

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

describe("draft posts", () => {
  it("includes draft posts in dev builds", async () => {
    const results = await build("");
    const draftPost = findByUrl(
      results,
      "/posts/test-draft-fixture/"
    );
    expect(draftPost).toBeDefined();
  });

  it("excludes draft posts in production builds", async () => {
    const results = await build("production");
    const draftPost = findByUrl(
      results,
      "/posts/test-draft-fixture/"
    );
    expect(draftPost).toBeUndefined();
  });

  it("includes non-draft posts in production builds", async () => {
    const results = await build("production");
    expect(results.length).toBeGreaterThan(0);
  });

  it("excludes draft posts from the post list page in production", async () => {
    const results = await build("production");
    const postsPage = findByUrl(results, "/posts/");
    expect(postsPage).toBeDefined();
    expect(postsPage.content).not.toContain("Test Draft Fixture");
  });

  it("includes draft posts in the post list page in dev", async () => {
    const results = await build("");
    const postsPage = findByUrl(results, "/posts/");
    expect(postsPage).toBeDefined();
    expect(postsPage.content).toContain("Test Draft Fixture");
  });

  it("excludes draft posts from RSS feed in production", async () => {
    const results = await build("production");
    const feed = findByUrl(results, "/feed.xml");
    expect(feed).toBeDefined();
    expect(feed.content).not.toContain("Test Draft Fixture");
  });

  it("shows [DRAFT] label in post list in dev", async () => {
    const results = await build("");
    const postsPage = findByUrl(results, "/posts/");
    expect(postsPage.content).toContain("[DRAFT]");
  });

  it("shows [DRAFT] label on draft post page in dev", async () => {
    const results = await build("");
    const draftPost = findByUrl(
      results,
      "/posts/test-draft-fixture/"
    );
    expect(draftPost.content).toContain("[DRAFT]");
  });

  it("excludes draft posts from homepage in production", async () => {
    const results = await build("production");
    const homepage = findByUrl(results, "/");
    expect(homepage).toBeDefined();
    expect(homepage.content).not.toContain("Test Draft Fixture");
  });

  it("does not show [DRAFT] label on non-draft post pages in dev", async () => {
    const results = await build("");
    const nonDraftPosts = results.filter(
      (r) =>
        r.url.startsWith("/posts/") &&
        r.url !== "/posts/" &&
        r.url !== "/posts/test-draft-fixture/"
    );
    for (const post of nonDraftPosts) {
      expect(post.content).not.toContain("[DRAFT]");
    }
  });
});
