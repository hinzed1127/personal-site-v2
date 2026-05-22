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
  cover_image: string | null;
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

  if (entry.cover_image) {
    lines.push(`cover_image: ${entry.cover_image}`);
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

  const coverImageInput = (await prompt(rl, "Cover image URL (paste or leave blank): ")).trim();
  const cover_image = coverImageInput || null;

  const embedInput = (await prompt(rl, "Bandcamp embed iframe (paste or leave blank): ")).trim();
  const bandcamp_embed = embedInput || null;

  const tracksInput = (await prompt(rl, "Favorite tracks (comma-separated, or blank): ")).trim();
  const favorite_tracks = tracksInput ? tracksInput.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const genresInput = (await prompt(rl, "Genres (comma-separated, or blank): ")).trim();
  const genres = genresInput ? genresInput.split(",").map((g) => g.trim()).filter(Boolean) : [];

  rl.close();

  const entry: AlbumEntry = { title, artist, date, links, bandcamp_embed, favorite_tracks, genres, cover_image };
  const frontmatter = buildFrontmatter(entry);

  const slug = `${toSlug(artist)}-${toSlug(title)}`;
  const filename = `${date}-${slug}.md`;
  const filepath = join(import.meta.dir, "..", "listening", filename);

  writeFileSync(filepath, frontmatter);
  console.log(`Created ${filepath}`);

  const editor = process.env.EDITOR ?? "code";
  execSync(`${editor} --wait "${filepath}"`, { stdio: "inherit" });
}
