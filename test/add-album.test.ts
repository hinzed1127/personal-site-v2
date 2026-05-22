// test/add-album.test.ts
import { describe, it, expect } from "vitest";
import { toSlug, buildFrontmatter } from "../scripts/add-album.ts";

describe("toSlug", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(toSlug("How You Been")).toBe("how-you-been");
  });

  it("strips non-alphanumeric characters", () => {
    expect(toSlug("AIN'T NO DAMN WAY!")).toBe("ain-t-no-damn-way");
  });

  it("collapses multiple hyphens", () => {
    expect(toSlug("Hello   World")).toBe("hello-world");
  });

  it("trims leading and trailing hyphens", () => {
    expect(toSlug("  Hello ")).toBe("hello");
  });
});

describe("buildFrontmatter", () => {
  it("produces valid frontmatter with all fields", () => {
    const result = buildFrontmatter({
      title: "Touch",
      artist: "Tortoise",
      date: "2026-05-19",
      links: [{ label: "Bandcamp", url: "https://intlanthem.bandcamp.com/album/touch" }],
      bandcamp_embed: '<iframe src="https://bandcamp.com/..." />',
      favorite_tracks: ["Yuma Vast", "Afternoon Atlas"],
      genres: ["post-rock", "jazz"],
      cover_image: "https://example.com/cover.jpg",
    });

    expect(result).toContain("title: Touch");
    expect(result).toContain("artist: Tortoise");
    expect(result).toContain("date: 2026-05-19");
    expect(result).toContain("label: Bandcamp");
    expect(result).toContain("- Yuma Vast");
    expect(result).toContain("- post-rock");
    expect(result).toContain("bandcamp_embed:");
    expect(result).toContain("cover_image: https://example.com/cover.jpg");
  });

  it("omits bandcamp_embed when not provided", () => {
    const result = buildFrontmatter({
      title: "Touch",
      artist: "Tortoise",
      date: "2026-05-19",
      links: [],
      bandcamp_embed: null,
      favorite_tracks: [],
      genres: [],
      cover_image: null,
    });
    expect(result).not.toContain("bandcamp_embed");
  });

  it("omits favorite_tracks when empty", () => {
    const result = buildFrontmatter({
      title: "Touch",
      artist: "Tortoise",
      date: "2026-05-19",
      links: [],
      bandcamp_embed: null,
      favorite_tracks: [],
      genres: [],
      cover_image: null,
    });
    expect(result).not.toContain("favorite_tracks");
  });

  it("omits cover_image when not provided", () => {
    const result = buildFrontmatter({
      title: "Touch",
      artist: "Tortoise",
      date: "2026-05-19",
      links: [],
      bandcamp_embed: null,
      favorite_tracks: [],
      genres: [],
      cover_image: null,
    });
    expect(result).not.toContain("cover_image");
  });
});
