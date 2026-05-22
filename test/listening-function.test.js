// test/listening-function.test.js
import { describe, it, expect } from "vitest";
import {
  parseRecentTracks,
  parseTopArtists,
  parseTopAlbums,
} from "../netlify/functions/listening.ts";

const makeTrack = (name, artist, album, uts, nowplaying = false) => ({
  name,
  artist: { "#text": artist },
  album: { "#text": album },
  image: [
    { "#text": "", size: "small" },
    { "#text": "https://example.com/large.jpg", size: "large" },
  ],
  date: nowplaying ? undefined : { uts },
  ...(nowplaying ? { "@attr": { nowplaying: "true" } } : {}),
});

describe("parseRecentTracks", () => {
  it("returns null for both when tracks array is empty", () => {
    const result = parseRecentTracks({ recenttracks: { track: [] } });
    expect(result.nowPlaying).toBeNull();
    expect(result.recentTrack).toBeNull();
  });

  it("detects a now-playing track", () => {
    const track = makeTrack("Song", "Artist", "Album", undefined, true);
    const result = parseRecentTracks({ recenttracks: { track: [track] } });
    expect(result.nowPlaying).toMatchObject({ track: "Song", artist: "Artist" });
    expect(result.recentTrack).toBeNull();
  });

  it("treats first track as recentTrack when not now-playing", () => {
    const track = makeTrack("Song", "Artist", "Album", "1700000000");
    const result = parseRecentTracks({ recenttracks: { track: [track] } });
    expect(result.nowPlaying).toBeNull();
    expect(result.recentTrack).toMatchObject({ track: "Song", date: "1700000000" });
  });

  it("uses second track as recentTrack when first is now-playing", () => {
    const playing = makeTrack("NowSong", "A", "B", undefined, true);
    const recent = makeTrack("PastSong", "C", "D", "1700000000");
    const result = parseRecentTracks({ recenttracks: { track: [playing, recent] } });
    expect(result.nowPlaying?.track).toBe("NowSong");
    expect(result.recentTrack?.track).toBe("PastSong");
  });

  it("extracts large image url", () => {
    const track = makeTrack("Song", "Artist", "Album", "1700000000");
    const result = parseRecentTracks({ recenttracks: { track: [track] } });
    expect(result.recentTrack?.image).toBe("https://example.com/large.jpg");
  });

  it("handles Last.fm returning a single track object instead of array", () => {
    const track = makeTrack("Song", "Artist", "Album", "1700000000");
    const result = parseRecentTracks({ recenttracks: { track } }); // object, not array
    expect(result.nowPlaying).toBeNull();
    expect(result.recentTrack).toMatchObject({ track: "Song", date: "1700000000" });
  });
});

describe("parseTopArtists", () => {
  it("returns empty array when no artists", () => {
    expect(parseTopArtists({})).toEqual([]);
  });

  it("maps artist name and playcount", () => {
    const data = {
      topartists: { artist: [{ name: "Tortoise", playcount: "42" }] },
    };
    expect(parseTopArtists(data)).toEqual([{ name: "Tortoise", playcount: "42", url: "" }]);
  });
});

describe("parseTopAlbums", () => {
  it("returns empty array when no albums", () => {
    expect(parseTopAlbums({})).toEqual([]);
  });

  it("maps album name, artist, playcount, and image", () => {
    const data = {
      topalbums: {
        album: [
          {
            name: "Touch",
            artist: { name: "Tortoise" },
            playcount: "10",
            image: [{ "#text": "https://example.com/large.jpg", size: "large" }],
          },
        ],
      },
    };
    expect(parseTopAlbums(data)).toEqual([
      {
        name: "Touch",
        artist: "Tortoise",
        playcount: "10",
        image: "https://example.com/large.jpg",
        url: "",
      },
    ]);
  });
});
