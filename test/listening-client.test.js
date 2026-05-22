import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadCache, saveCache, isWithinLastWeek, isWithinLastTenMinutes } from "../listening-client.js";

const mockData = {
  nowPlaying: null,
  recentTrack: { track: "Song", artist: "Artist", album: "Album", image: "", date: "1700000000" },
  topArtists: { week: [], month: [] },
  topAlbums: { week: [], month: [] },
};

// Minimal localStorage stub
const store = {};
const mockLocalStorage = {
  getItem: (key) => store[key] ?? null,
  setItem: (key, val) => { store[key] = String(val); },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};
vi.stubGlobal("localStorage", mockLocalStorage);

describe("isWithinLastWeek", () => {
  it("returns true for a timestamp from 1 hour ago", () => {
    const uts = String(Math.floor(Date.now() / 1000) - 3600);
    expect(isWithinLastWeek(uts)).toBe(true);
  });

  it("returns false for a timestamp from 8 days ago", () => {
    const uts = String(Math.floor(Date.now() / 1000) - 8 * 24 * 60 * 60);
    expect(isWithinLastWeek(uts)).toBe(false);
  });
});

describe("isWithinLastTenMinutes", () => {
  it("returns true for a timestamp from 5 minutes ago", () => {
    const uts = String(Math.floor(Date.now() / 1000) - 300);
    expect(isWithinLastTenMinutes(uts)).toBe(true);
  });

  it("returns false for a timestamp from 15 minutes ago", () => {
    const uts = String(Math.floor(Date.now() / 1000) - 900);
    expect(isWithinLastTenMinutes(uts)).toBe(false);
  });
});

describe("loadCache / saveCache", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it("returns null when nothing is cached", () => {
    expect(loadCache()).toBeNull();
  });

  it("returns saved data after saveCache", () => {
    saveCache(mockData);
    expect(loadCache()).toEqual(mockData);
  });

  it("returns null when localStorage contains invalid JSON", () => {
    mockLocalStorage.setItem("listening-data", "not-json{{{");
    expect(loadCache()).toBeNull();
  });
});
