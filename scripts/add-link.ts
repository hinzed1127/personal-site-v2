#!/usr/bin/env bun

import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";

const input = process.argv.slice(2).join(" ").trim();

if (!input) {
  console.error("Usage: add-link [title](https://url) OR add-link https://url");
  process.exit(1);
}

const mdLinkMatch = input.match(/^\[(.+?)\]\((https?:\/\/.+?)\)$/);

let title: string;
let url: string;

if (mdLinkMatch) {
  title = mdLinkMatch[1];
  url = mdLinkMatch[2];
} else if (/^https?:\/\//.test(input)) {
  url = input;
  process.stdout.write(`Fetching title from ${url}...\n`);
  try {
    const res = await fetch(url);
    const html = await res.text();
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    title = match ? match[1].trim() : url;
  } catch {
    console.error("Could not fetch page title, using URL as title.");
    title = url;
  }
} else {
  console.error("Input must be a markdown link [title](url) or a plain URL.");
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const filename = `${date}-${slug}.md`;
const filepath = join(import.meta.dir, "..", "links", filename);

const content = `---
title: "${title}"
link: ${url}
date: ${date}
---
`;

writeFileSync(filepath, content);
console.log(`Created ${filepath}`);

execSync(`code --wait "${filepath}"`, { stdio: "inherit" });
