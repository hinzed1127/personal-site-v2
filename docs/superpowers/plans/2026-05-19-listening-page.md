# /listening Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/listening` page with a live now-playing/stats section (via Netlify Function + Last.fm API) and a static curated album feed (via a `listening/` Eleventy collection and `add-album` script).

**Architecture:** A static Eleventy page renders the album feed at build time. A single Netlify Function at `/api/listening` proxies Last.fm and returns now-playing, recent track, and top artists/albums in one JSON response. Client-side JS fetches this once on page load to hydrate the banner and sidebar.

**Tech Stack:** Eleventy 3, Liquid templates, Netlify Functions (TypeScript), Vitest, Bun

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `netlify/functions/listening.ts` | Create | Netlify Function — proxies Last.fm API |
| `netlify.toml` | Create | Configures Netlify Function routing |
| `listening/listening.json` | Create | Eleventy collection defaults (layout, permalink) |
| `listening/` | Create dir | Album entry markdown files live here |
| `_includes/listening.liquid` | Create | Full `/listening` page layout (banner + feed + sidebar) |
| `_includes/listening-entry.liquid` | Create | Single album entry partial |
| `pages/listening.md` | Create | Eleventy page that renders the listening layout |
| `listening-client.js` | Create | Client-side JS: fetch `/api/listening`, hydrate banner + sidebar |
| `_includes/base.liquid` | Modify | Add "Listening" nav link |
| `.eleventy.js` | Modify | Register `listening` collection |
| `package.json` | Modify | Add `add-album` script entry |
| `scripts/add-album.ts` | Create | Interactive script to scaffold album entry markdown |
| `styles.css` | Modify | Styles for listening page layout, banner, sidebar, album entries |
| `test/listening-function.test.js` | Create | Unit tests for Netlify Function response parsing |
| `test/add-album.test.ts` | Create | Unit tests for add-album slug/frontmatter generation |
| `test/listening.test.js` | Create | Eleventy integration tests for /listening route |

---

## Task 1: Netlify Function scaffold + routing

**Files:**
- Create: `netlify/functions/listening.ts`
- Create: `netlify.toml`

- [ ] **Step 1: Create `netlify.toml`**

```toml
[build]
  command = "bun run build"
  publish = "_site"

[[redirects]]
  from = "/api/listening"
  to = "/.netlify/functions/listening"
  status = 200
```

- [ ] **Step 2: Create the Netlify Function stub**

```typescript
// netlify/functions/listening.ts
import type { Context } from "@netlify/functions";

const LASTFM_BASE = "https://ws.audioscrobbler.com/2.0/";

function lastfmUrl(method: string, params: Record<string, string>): string {
  const apiKey = process.env.LASTFM_API_KEY;
  const username = process.env.LASTFM_USERNAME;
  const query = new URLSearchParams({
    method,
    user: username ?? "",
    api_key: apiKey ?? "",
    format: "json",
    ...params,
  });
  return `${LASTFM_BASE}?${query}`;
}

export interface NowPlayingTrack {
  artist: string;
  track: string;
  album: string;
  image: string;
}

export interface RecentTrack extends NowPlayingTrack {
  date: string;
}

export interface TopArtist {
  name: string;
  playcount: string;
}

export interface TopAlbum {
  name: string;
  artist: string;
  playcount: string;
  image: string;
}

export interface ListeningResponse {
  nowPlaying: NowPlayingTrack | null;
  recentTrack: RecentTrack | null;
  topArtists: { week: TopArtist[]; month: TopArtist[] };
  topAlbums: { week: TopAlbum[]; month: TopAlbum[] };
}

function extractImage(images: Array<{ "#text": string; size: string }>): string {
  return images?.find((i) => i.size === "large")?.["#text"] ?? "";
}

export function parseRecentTracks(data: any): {
  nowPlaying: NowPlayingTrack | null;
  recentTrack: RecentTrack | null;
} {
  const tracks: any[] = data?.recenttracks?.track ?? [];
  if (tracks.length === 0) return { nowPlaying: null, recentTrack: null };

  const first = tracks[0];
  const isNowPlaying = first["@attr"]?.nowplaying === "true";

  const nowPlaying: NowPlayingTrack | null = isNowPlaying
    ? {
        artist: first.artist["#text"],
        track: first.name,
        album: first.album["#text"],
        image: extractImage(first.image),
      }
    : null;

  const recentSource = isNowPlaying ? tracks[1] : tracks[0];
  const recentTrack: RecentTrack | null = recentSource
    ? {
        artist: recentSource.artist["#text"],
        track: recentSource.name,
        album: recentSource.album["#text"],
        image: extractImage(recentSource.image),
        date: recentSource.date?.uts ?? "",
      }
    : null;

  return { nowPlaying, recentTrack };
}

export function parseTopArtists(data: any): TopArtist[] {
  return (data?.topartists?.artist ?? []).map((a: any) => ({
    name: a.name,
    playcount: a.playcount,
  }));
}

export function parseTopAlbums(data: any): TopAlbum[] {
  return (data?.topalbums?.album ?? []).map((a: any) => ({
    name: a.name,
    artist: a.artist?.name ?? "",
    playcount: a.playcount,
    image: extractImage(a.image),
  }));
}

export default async function handler(_req: Request, _ctx: Context): Promise<Response> {
  try {
    const [recentData, artistsWeek, artistsMonth, albumsWeek, albumsMonth] =
      await Promise.all([
        fetch(lastfmUrl("user.getRecentTracks", { limit: "2" })).then((r) => r.json()),
        fetch(lastfmUrl("user.getTopArtists", { period: "7day", limit: "5" })).then((r) => r.json()),
        fetch(lastfmUrl("user.getTopArtists", { period: "1month", limit: "5" })).then((r) => r.json()),
        fetch(lastfmUrl("user.getTopAlbums", { period: "7day", limit: "5" })).then((r) => r.json()),
        fetch(lastfmUrl("user.getTopAlbums", { period: "1month", limit: "5" })).then((r) => r.json()),
      ]);

    const { nowPlaying, recentTrack } = parseRecentTracks(recentData);

    const response: ListeningResponse = {
      nowPlaying,
      recentTrack,
      topArtists: {
        week: parseTopArtists(artistsWeek),
        month: parseTopArtists(artistsMonth),
      },
      topAlbums: {
        week: parseTopAlbums(albumsWeek),
        month: parseTopAlbums(albumsMonth),
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch listening data" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
}
```

- [ ] **Step 3: Install `@netlify/functions` types**

```bash
bun add -d @netlify/functions
```

- [ ] **Step 4: Commit**

```bash
git add netlify/functions/listening.ts netlify.toml package.json bun.lock
git commit -m "feat: add Netlify Function for Last.fm listening data"
```

---

## Task 2: Unit tests for Netlify Function parsing

**Files:**
- Create: `test/listening-function.test.js`

The parsing functions are exported from `netlify/functions/listening.ts` — test them directly without making real HTTP calls.

- [ ] **Step 1: Write the failing tests**

```js
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
});

describe("parseTopArtists", () => {
  it("returns empty array when no artists", () => {
    expect(parseTopArtists({})).toEqual([]);
  });

  it("maps artist name and playcount", () => {
    const data = {
      topartists: { artist: [{ name: "Tortoise", playcount: "42" }] },
    };
    expect(parseTopArtists(data)).toEqual([{ name: "Tortoise", playcount: "42" }]);
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
      },
    ]);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
bun run test test/listening-function.test.js
```

Expected: FAIL — functions not yet resolvable (or type errors if TypeScript resolution fails).

- [ ] **Step 3: Run tests to confirm they pass (no implementation changes needed — functions are already written in Task 1)**

```bash
bun run test test/listening-function.test.js
```

Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add test/listening-function.test.js
git commit -m "test: unit tests for Last.fm response parsing"
```

---

## Task 3: Eleventy collection + page scaffold

**Files:**
- Create: `listening/listening.json`
- Create: `pages/listening.md`
- Modify: `.eleventy.js`
- Modify: `_includes/base.liquid`

- [ ] **Step 1: Write failing Eleventy integration test**

```js
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
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
bun run test test/listening.test.js
```

Expected: FAIL — `/listening/` route not found.

- [ ] **Step 3: Create `listening/listening.json`**

```json
{
  "layout": "listening-entry.liquid",
  "permalink": "/listening/{{ title | slugify }}/",
  "tags": ["listening"]
}
```

- [ ] **Step 4: Register `listening` collection in `.eleventy.js`**

Add after the existing `links` collection registration (around line 15):

```js
config.addCollection("listening", (collectionApi) => {
  return collectionApi.getFilteredByTag("listening").sort((a, b) => b.date - a.date);
});
```

- [ ] **Step 5: Create `pages/listening.md`**

```markdown
---
title: Listening
layout: listening.liquid
permalink: /listening/
---
```

- [ ] **Step 6: Add "Listening" nav link in `_includes/base.liquid`**

Add after the existing Posts nav item:

```html
<li><a href="/listening/">Listening</a></li>
```

- [ ] **Step 7: Run test to confirm it still fails (templates not yet created)**

```bash
bun run test test/listening.test.js
```

Expected: FAIL or error — `listening.liquid` template missing.

- [ ] **Step 8: Commit collection setup**

```bash
git add listening/listening.json pages/listening.md .eleventy.js _includes/base.liquid
git commit -m "feat: register listening collection and page route"
```

---

## Task 4: Album entry template

**Files:**
- Create: `_includes/listening-entry.liquid`

This is the layout for individual album entry pages at `/listening/{slug}/`.

- [ ] **Step 1: Create `_includes/listening-entry.liquid`**

```liquid
---
layout: base.liquid
---

<article class="album-entry">
  <header class="album-entry__header">
    <div class="album-entry__meta">
      <h1 class="album-entry__title">{{ title }}</h1>
      <p class="album-entry__artist">{{ artist }}</p>
      <time class="album-entry__date" datetime="{{ date | date: '%Y-%m-%d', 'utc' }}">
        {{ date | date: '%b %d, %Y', 'utc' }}
      </time>
    </div>
  </header>

  {% if genres and genres.size > 0 %}
    <ul class="album-entry__genres">
      {% for genre in genres %}
        <li>{{ genre }}</li>
      {% endfor %}
    </ul>
  {% endif %}

  {% if favorite_tracks and favorite_tracks.size > 0 %}
    <div class="album-entry__tracks">
      <strong>Favorite tracks</strong>
      <ul>
        {% for track in favorite_tracks %}
          <li>{{ track }}</li>
        {% endfor %}
      </ul>
    </div>
  {% endif %}

  {% if links and links.size > 0 %}
    <ul class="album-entry__links">
      {% for link in links %}
        <li><a href="{{ link.url }}" target="_blank" rel="noopener">{{ link.label }}</a></li>
      {% endfor %}
    </ul>
  {% endif %}

  {% if bandcamp_embed %}
    <div class="album-entry__embed">
      {{ bandcamp_embed }}
    </div>
  {% endif %}

  {% if content %}
    <div class="album-entry__commentary">
      {{ content }}
    </div>
  {% endif %}
</article>
```

- [ ] **Step 2: Commit**

```bash
git add _includes/listening-entry.liquid
git commit -m "feat: album entry template"
```

---

## Task 5: Listening page layout template + client JS stub

**Files:**
- Create: `_includes/listening.liquid`
- Create: `listening-client.js`

- [ ] **Step 1: Create `listening-client.js`**

```js
(async function () {
  const banner = document.getElementById("listening-banner");
  const bannerLabel = document.getElementById("listening-banner-label");
  const bannerTrack = document.getElementById("listening-banner-track");
  const bannerArtist = document.getElementById("listening-banner-artist");
  const sidebarContent = document.getElementById("listening-sidebar-content");
  const sidebarError = document.getElementById("listening-sidebar-error");
  const artistsList = document.getElementById("listening-top-artists");
  const albumsList = document.getElementById("listening-top-albums");
  const weekBtn = document.getElementById("listening-week-btn");
  const monthBtn = document.getElementById("listening-month-btn");

  let data = null;
  let currentPeriod = "week";

  function isWithinLastWeek(uts) {
    const ONE_WEEK_SECS = 7 * 24 * 60 * 60;
    return Date.now() / 1000 - parseInt(uts, 10) < ONE_WEEK_SECS;
  }

  function renderBanner(d) {
    if (d.nowPlaying) {
      bannerLabel.textContent = "Now Playing";
      bannerTrack.textContent = d.nowPlaying.track;
      bannerArtist.textContent = d.nowPlaying.artist;
      banner.hidden = false;
    } else if (d.recentTrack && isWithinLastWeek(d.recentTrack.date)) {
      bannerLabel.textContent = "Recently Played";
      bannerTrack.textContent = d.recentTrack.track;
      bannerArtist.textContent = d.recentTrack.artist;
      banner.hidden = false;
    }
    // else: banner stays hidden
  }

  function renderSidebar(period) {
    if (!data) return;
    const artists = data.topArtists[period] ?? [];
    const albums = data.topAlbums[period] ?? [];

    artistsList.innerHTML = artists
      .map((a) => `<li>${a.name} <span class="playcount">${a.playcount}</span></li>`)
      .join("");

    albumsList.innerHTML = albums
      .map((a) => `<li>${a.name} <span class="artist">${a.artist}</span></li>`)
      .join("");
  }

  function setActivePeriod(period) {
    currentPeriod = period;
    weekBtn.classList.toggle("active", period === "week");
    monthBtn.classList.toggle("active", period === "month");
    renderSidebar(period);
  }

  weekBtn.addEventListener("click", () => setActivePeriod("week"));
  monthBtn.addEventListener("click", () => setActivePeriod("month"));

  try {
    const res = await fetch("/api/listening");
    data = await res.json();

    if (data.error) throw new Error(data.error);

    renderBanner(data);
    sidebarContent.hidden = false;
    renderSidebar(currentPeriod);
  } catch (_err) {
    sidebarError.hidden = false;
  } finally {
    document.getElementById("listening-sidebar-loading")?.remove();
    document.getElementById("listening-banner-loading")?.remove();
  }
})();
```

- [ ] **Step 2: Create `_includes/listening.liquid`**

```liquid
---
layout: base.liquid
---

{{# Now Playing / Recently Played banner #}}
<div id="listening-banner" class="listening-banner" hidden>
  <span id="listening-banner-label" class="listening-banner__label"></span>
  <span id="listening-banner-track" class="listening-banner__track"></span>
  <span class="listening-banner__sep">—</span>
  <span id="listening-banner-artist" class="listening-banner__artist"></span>
</div>

<div class="listening-layout">
  {{# Album feed #}}
  <main class="listening-feed">
    <h1>Listening</h1>
    {% for entry in collections.listening %}
      <article class="album-card">
        <h2><a href="{{ entry.url }}">{{ entry.data.title }}</a></h2>
        <p class="album-card__artist">{{ entry.data.artist }}</p>
        <time datetime="{{ entry.date | date: '%Y-%m-%d', 'utc' }}">{{ entry.date | date: '%b %d, %Y', 'utc' }}</time>

        {% if entry.data.genres and entry.data.genres.size > 0 %}
          <ul class="album-card__genres">
            {% for genre in entry.data.genres %}
              <li>{{ genre }}</li>
            {% endfor %}
          </ul>
        {% endif %}

        {% if entry.data.links and entry.data.links.size > 0 %}
          <ul class="album-card__links">
            {% for link in entry.data.links %}
              <li><a href="{{ link.url }}" target="_blank" rel="noopener">{{ link.label }}</a></li>
            {% endfor %}
          </ul>
        {% endif %}
      </article>
    {% else %}
      <p>No album entries yet.</p>
    {% endfor %}
  </main>

  {{# Stats sidebar #}}
  <aside class="listening-sidebar">
    <div class="listening-sidebar__toggle">
      <button id="listening-week-btn" class="active">Week</button>
      <button id="listening-month-btn">Month</button>
    </div>

    <div id="listening-sidebar-loading" class="listening-sidebar__loading">Loading…</div>

    <div id="listening-sidebar-content" hidden>
      <h3>Top Artists</h3>
      <ul id="listening-top-artists"></ul>
      <h3>Top Albums</h3>
      <ul id="listening-top-albums"></ul>
    </div>

    <div id="listening-sidebar-error" class="listening-sidebar__error" hidden>
      😔 Listening stats currently unavailable
    </div>
  </aside>
</div>

<script src="/vendor/listening-client.js" defer></script>
```

- [ ] **Step 3: Register `listening-client.js` as a passthrough copy in `.eleventy.js`**

Add after the existing `photo-stack.js` passthrough (around line 39):

```js
config.addPassthroughCopy({ "listening-client.js": "vendor/listening-client.js" });
```

- [ ] **Step 4: Run Eleventy integration tests**

```bash
bun run test test/listening.test.js
```

Expected: PASS — `/listening/` route now exists with nav link.

- [ ] **Step 5: Commit**

```bash
git add _includes/listening.liquid listening-client.js .eleventy.js
git commit -m "feat: listening page layout, sidebar, and client JS"
```

---

## Task 6: Styles for listening page

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Append listening page styles to `styles.css`**

```css
/* ── Listening page ─────────────────────────────── */

.listening-banner {
  background: var(--lavender);
  border-left: 4px solid var(--navy);
  padding: 0.6em 1em;
  margin-bottom: 1.5em;
  display: flex;
  align-items: center;
  gap: 0.4em;
  font-size: 0.9rem;
}

.listening-banner__label {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: var(--navy);
}

.listening-banner__sep {
  color: var(--gray);
}

.listening-layout {
  display: grid;
  grid-template-columns: 1fr 14em;
  gap: 2em;
  align-items: start;
}

.listening-feed {
  min-width: 0;
}

.listening-sidebar {
  position: sticky;
  top: 1em;
}

.listening-sidebar__toggle {
  display: flex;
  gap: 0.5em;
  margin-bottom: 1em;
}

.listening-sidebar__toggle button {
  border: 1px solid var(--navy);
  background: none;
  padding: 0.2em 0.6em;
  cursor: pointer;
  font-family: var(--font-optima);
  font-size: 0.85rem;
}

.listening-sidebar__toggle button.active {
  background: var(--navy);
  color: var(--white);
}

.listening-sidebar__error {
  font-size: 0.85rem;
  color: var(--gray);
}

.listening-sidebar__loading {
  font-size: 0.85rem;
  color: var(--gray);
}

.listening-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0 0 1em;
  font-size: 0.85rem;
}

.listening-sidebar li {
  padding: 0.2em 0;
  border-bottom: 1px solid var(--silver);
}

.listening-sidebar .playcount,
.listening-sidebar .artist {
  color: var(--gray);
  font-size: 0.8em;
  margin-left: 0.4em;
}

.album-card {
  margin-bottom: 2em;
  padding-bottom: 2em;
  border-bottom: 1px solid var(--silver);
}

.album-card__artist {
  color: var(--gray);
  margin: 0.2em 0;
}

.album-card__genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4em;
  list-style: none;
  padding: 0;
  margin: 0.5em 0;
}

.album-card__genres li {
  font-size: 0.75rem;
  background: var(--lavender);
  padding: 0.1em 0.5em;
  border-radius: 999px;
}

.album-card__links {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 0.8em;
  margin: 0.5em 0 0;
  font-size: 0.85rem;
}

/* Album entry page */
.album-entry {
  max-width: 38em;
}

.album-entry__artist {
  color: var(--gray);
  margin: 0.2em 0 0.5em;
}

.album-entry__genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4em;
  list-style: none;
  padding: 0;
  margin: 0.5em 0 1em;
}

.album-entry__genres li {
  font-size: 0.75rem;
  background: var(--lavender);
  padding: 0.1em 0.5em;
  border-radius: 999px;
}

.album-entry__tracks {
  margin: 1em 0;
}

.album-entry__tracks ul {
  margin: 0.3em 0 0 1.2em;
}

.album-entry__links {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 0.8em;
  margin: 0.5em 0 1em;
  font-size: 0.85rem;
}

.album-entry__embed {
  margin: 1em 0;
}

.album-entry__embed iframe {
  max-width: 100%;
}

.album-entry__commentary {
  margin-top: 1.5em;
}
```

- [ ] **Step 2: Commit**

```bash
git add styles.css
git commit -m "feat: styles for listening page, sidebar, and album entries"
```

---

## Task 7: `add-album` script

**Files:**
- Create: `scripts/add-album.ts`
- Modify: `package.json`

- [ ] **Step 1: Write failing tests for add-album utilities**

```typescript
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
    });

    expect(result).toContain("title: Touch");
    expect(result).toContain("artist: Tortoise");
    expect(result).toContain("date: 2026-05-19");
    expect(result).toContain("label: Bandcamp");
    expect(result).toContain("- Yuma Vast");
    expect(result).toContain("- post-rock");
    expect(result).toContain("bandcamp_embed:");
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
    });
    expect(result).not.toContain("favorite_tracks");
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
bun run test test/add-album.test.ts
```

Expected: FAIL — `toSlug` and `buildFrontmatter` not exported yet.

- [ ] **Step 3: Create `scripts/add-album.ts`**

```typescript
#!/usr/bin/env bun

import { writeFileSync } from "fs";
import { join } from "path";
import { createInterface } from "readline";
import { execSync } from "child_process";

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface AlbumEntry {
  title: string;
  artist: string;
  date: string;
  links: Array<{ label: string; url: string }>;
  bandcamp_embed: string | null;
  favorite_tracks: string[];
  genres: string[];
}

export function buildFrontmatter(entry: AlbumEntry): string {
  const lines: string[] = ["---"];
  lines.push(`title: ${entry.title}`);
  lines.push(`artist: ${entry.artist}`);
  lines.push(`date: ${entry.date}`);

  if (entry.genres.length > 0) {
    lines.push("genres:");
    for (const g of entry.genres) lines.push(`  - ${g}`);
  }

  if (entry.links.length > 0) {
    lines.push("links:");
    for (const l of entry.links) lines.push(`  - { label: ${l.label}, url: ${l.url} }`);
  }

  if (entry.bandcamp_embed) {
    lines.push(`bandcamp_embed: '${entry.bandcamp_embed.replace(/'/g, "\\'")}'`);
  }

  if (entry.favorite_tracks.length > 0) {
    lines.push("favorite_tracks:");
    for (const t of entry.favorite_tracks) lines.push(`  - ${t}`);
  }

  lines.push("---", "");
  return lines.join("\n");
}

// ── Interactive prompt (only runs when executed directly) ─────────────────

async function prompt(rl: ReturnType<typeof createInterface>, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

if (import.meta.main) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  const artist = (await prompt(rl, "Artist: ")).trim();
  const title = (await prompt(rl, "Album title: ")).trim();

  const today = new Date().toISOString().slice(0, 10);
  const dateInput = (await prompt(rl, `Date [${today}]: `)).trim();
  const date = dateInput || today;

  const links: Array<{ label: string; url: string }> = [];
  while (true) {
    const addLink = (await prompt(rl, "Add a link? (y/n): ")).trim().toLowerCase();
    if (addLink !== "y") break;
    const label = (await prompt(rl, "  Label (e.g. Bandcamp, Qobuz, AllMusic): ")).trim();
    const url = (await prompt(rl, "  URL: ")).trim();
    links.push({ label, url });
  }

  const embedInput = (await prompt(rl, "Bandcamp embed iframe (paste or leave blank): ")).trim();
  const bandcamp_embed = embedInput || null;

  const tracksInput = (await prompt(rl, "Favorite tracks (comma-separated, or blank): ")).trim();
  const favorite_tracks = tracksInput ? tracksInput.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const genresInput = (await prompt(rl, "Genres (comma-separated, or blank): ")).trim();
  const genres = genresInput ? genresInput.split(",").map((g) => g.trim()).filter(Boolean) : [];

  rl.close();

  const entry: AlbumEntry = { title, artist, date, links, bandcamp_embed, favorite_tracks, genres };
  const frontmatter = buildFrontmatter(entry);

  const slug = `${toSlug(artist)}-${toSlug(title)}`;
  const filename = `${date}-${slug}.md`;
  const filepath = join(import.meta.dir, "..", "listening", filename);

  writeFileSync(filepath, frontmatter);
  console.log(`Created ${filepath}`);

  const editor = process.env.EDITOR ?? "code";
  execSync(`${editor} --wait "${filepath}"`, { stdio: "inherit" });
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
bun run test test/add-album.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Add `add-album` script to `package.json`**

Add to the `scripts` object:

```json
"add-album": "bun scripts/add-album.ts"
```

- [ ] **Step 6: Commit**

```bash
git add scripts/add-album.ts test/add-album.test.ts package.json
git commit -m "feat: add-album script with slug and frontmatter helpers"
```

---

## Task 8: Add a sample album entry + full integration smoke test

**Files:**
- Create: `listening/2026-05-19-tortoise-touch.md`

This verifies the whole pipeline works end-to-end before shipping.

- [ ] **Step 1: Create a sample album entry**

```markdown
---
title: Touch
artist: Tortoise
date: 2026-05-19
genres:
  - post-rock
  - jazz
links:
  - { label: Bandcamp, url: https://intlanthem.bandcamp.com/album/touch }
favorite_tracks:
  - Yuma Vast
  - Afternoon Atlas
---

A remarkable return from Tortoise after years of quiet. *Touch* is patient and alive — each track has the sense of something being worked out in real time, unhurried.
```

- [ ] **Step 2: Extend listening integration tests**

Add to `test/listening.test.js`:

```js
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
```

- [ ] **Step 3: Run all tests**

```bash
bun run test
```

Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add listening/2026-05-19-tortoise-touch.md test/listening.test.js
git commit -m "feat: sample album entry and full integration tests"
```

---

## Task 9: Environment variable setup + Netlify deploy check

**Files:** none (config only)

- [ ] **Step 1: Create `.env.example` documenting required variables**

```bash
# .env.example
LASTFM_API_KEY=your_lastfm_api_key_here
LASTFM_USERNAME=your_lastfm_username_here
```

- [ ] **Step 2: Add `.env` to `.gitignore` if not already present**

Check `.gitignore` — add `.env` if missing:

```bash
grep -q '^\.env$' .gitignore || echo ".env" >> .gitignore
```

- [ ] **Step 3: Set environment variables in Netlify dashboard**

In the Netlify UI: Site settings → Environment variables → Add:
- `LASTFM_API_KEY` — from https://www.last.fm/api/account/create
- `LASTFM_USERNAME` — your Last.fm username

- [ ] **Step 4: Commit `.env.example`**

```bash
git add .env.example .gitignore
git commit -m "chore: document required env vars for Last.fm integration"
```

- [ ] **Step 5: Deploy and manually verify**

Push to main and confirm in the Netlify deploy log that the function builds. Hit `/api/listening` on the live domain and verify the JSON response shape matches the spec.
