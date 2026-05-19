# /listening Page — Design Spec

**Date:** 2026-05-19

## Overview

A `/listening` page on danhinze.com that surfaces Last.fm data (now playing, recent tracks, top artists/albums) alongside a curated feed of album entries with commentary.

---

## Architecture

A static Eleventy page with client-side data hydration via a single Netlify Function.

- **`/listening`** — Eleventy page, renders album feed statically at build time
- **`/api/listening`** — Netlify Function (`netlify/functions/listening.ts`) that proxies Last.fm API, returns all live data in one response
- **`listening/` collection** — markdown files, one per album entry, built by Eleventy like `links/`

The page fetches `/api/listening` once on load and populates the now-playing banner and stats sidebar. The album feed is fully static and renders immediately.

---

## Netlify Function

**Endpoint:** `GET /api/listening`

Calls Last.fm API in parallel:
- `user.getRecentTracks` (limit 1, catches `nowplaying` flag + most recent track)
- `user.getTopArtists` for `7day` and `1month` periods
- `user.getTopAlbums` for `7day` and `1month` periods

**Response shape:**
```json
{
  "nowPlaying": { "artist": "...", "track": "...", "album": "...", "image": "..." } | null,
  "recentTrack": { "artist": "...", "track": "...", "album": "...", "image": "...", "date": "..." } | null,
  "topArtists": {
    "week": [{ "name": "...", "playcount": "..." }],
    "month": [{ "name": "...", "playcount": "..." }]
  },
  "topAlbums": {
    "week": [{ "name": "...", "artist": "...", "playcount": "...", "image": "..." }],
    "month": [{ "name": "...", "artist": "...", "playcount": "...", "image": "..." }]
  }
}
```

**Error handling:** Returns a structured JSON error response (not a 500) if Last.fm is unavailable, so the client can degrade gracefully per-zone.

**Auth:** Last.fm API key stored in a Netlify environment variable (`LASTFM_API_KEY`). Last.fm username stored as `LASTFM_USERNAME`.

---

## Page Layout

```
[ Now Playing / Recently Played banner — hidden if nothing within last 7 days ]

[ Album Feed (main, scrollable) ]    [ Stats Sidebar (sticky) ]
  Album entries, newest first          [ Week | Month ] toggle
                                       Top Artists (5)
                                       Top Albums (5)
```

**Now Playing / Recently Played banner:**
- If `nowPlaying` is set: renders with "Now Playing" label, track name, artist, and album art image
- Else if `recentTrack` date is within the last 7 days: renders with "Recently Played" label, track name, artist, and album art image
- Otherwise: hidden

**Stats sidebar:**
- `position: sticky` — stays in view while album feed scrolls
- Week/Month toggle switches between pre-fetched data (no second fetch)
- On fetch failure: displays "😔 Listening stats currently unavailable"
- Future enhancement (not MVP): collapse/minimize button that centers the album feed

**Loading states:**
- Album feed renders immediately (static)
- Banner and sidebar show a subtle loading indicator until fetch resolves
- Failures degrade independently — banner and sidebar can fail without affecting each other

---

## Album Entry Content Model

**Directory:** `listening/`

**Filename:** `YYYY-MM-DD-artist-album-slug.md`

**Frontmatter:**
```yaml
---
title: Album Title
artist: Artist Name
date: 2026-05-19
favorite_tracks:
  - Track Name
  - Track Name
genres:
  - jazz
  - experimental
links:
  - { label: Bandcamp, url: https://...bandcamp.com/album/... }
  - { label: Qobuz, url: https://... }
  - { label: AllMusic, url: https://... }
bandcamp_embed: <iframe ...>   # optional — only if available on Bandcamp
---
Your commentary here in markdown.
```

**Template rendering rules:**
- `links`: only rendered if non-empty; each link renders as a labeled anchor
- `bandcamp_embed`: only rendered if present — full iframe embed from Bandcamp share dialog
- `favorite_tracks`: only rendered if non-empty
- `genres`: only rendered if non-empty
- Body content (commentary): rendered as markdown

**Per-entry layout:**
```
Album art (if available) — Artist — Title
Genres
Favorite tracks
Links (Bandcamp, Qobuz, etc.)
Bandcamp embed (if present)
Commentary (markdown)
```

---

## `add-album` Script

**Run with:** `bun run add-album`

**Prompt flow:**
1. Artist name
2. Album title
3. Date (default: today)
4. Links loop: add a link? (label + URL) — repeats until done
5. Bandcamp embed? (paste iframe or skip)
6. Favorite tracks (comma-separated)
7. Genres (comma-separated)
8. Creates file at `listening/YYYY-MM-DD-{slug}.md`, opens in `$EDITOR`

---

## Eleventy Integration

- New collection `listening` in `.eleventy.js`, sorted newest-first (mirrors `links` collection pattern)
- New page `pages/listening.md` with `permalink: /listening/`
- New include `_includes/listening-entry.liquid` for album entry rendering
- New include `_includes/listening.liquid` for the full page layout
- Add "Listening" to nav in `_includes/base.liquid`

---

## Testing

- **Vitest unit tests** for `add-album` script: slug generation, frontmatter output shape
- **Vitest unit test** for Netlify Function response parsing/normalization (mock Last.fm HTTP responses)
- Follows existing test patterns in `test/`

---

## Future Enhancements (out of scope for MVP)

- Sidebar minimize/collapse button that expands album feed to full width
- RSS feed for album entries
