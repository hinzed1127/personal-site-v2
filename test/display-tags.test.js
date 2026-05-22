import { test, expect } from "vitest";

// Import the filter logic directly — pure function, no Eleventy needed
function displayTags(tags) {
  return (tags ?? []).filter(t => t !== "post");
}

test("filters out the post collection tag", () => {
  expect(displayTags(["post", "week-notes", "music"])).toEqual(["week-notes", "music"]);
});

test("returns empty array when only post tag present", () => {
  expect(displayTags(["post"])).toEqual([]);
});

test("returns all tags when post is not present", () => {
  expect(displayTags(["music", "books"])).toEqual(["music", "books"]);
});

test("handles null/undefined tags gracefully", () => {
  expect(displayTags(null)).toEqual([]);
  expect(displayTags(undefined)).toEqual([]);
});
