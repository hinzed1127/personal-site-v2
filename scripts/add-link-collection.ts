#!/usr/bin/env bun

import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";
import * as readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function prompt(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

async function fetchTitle(url: string): Promise<string> {
  process.stdout.write(`Fetching title from ${url}...\n`);
  try {
    const res = await fetch(url);
    const html = await res.text();
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1].trim() : url;
  } catch {
    console.error("Could not fetch page title, using URL as title.");
    return url;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const collectionTitle = (await prompt("Collection title: ")).trim();
if (!collectionTitle) {
  console.error("Title is required.");
  process.exit(1);
}

const links: { title: string; url: string }[] = [];

console.log('Add links one at a time. Accepts [title](url) or a plain URL. Press Enter with no input when done.');

while (true) {
  const input = (await prompt(`Link ${links.length + 1}: `)).trim();
  if (!input) {
    if (links.length < 2) {
      console.error("At least 2 links are required.");
      continue;
    }
    break;
  }

  const mdLinkMatch = input.match(/^\[(.+?)\]\((https?:\/\/.+?)\)$/);
  let title: string;
  let url: string;

  if (mdLinkMatch) {
    title = mdLinkMatch[1];
    url = mdLinkMatch[2];
  } else if (/^https?:\/\//.test(input)) {
    url = input;
    title = await fetchTitle(url);
  } else {
    console.error("Input must be a markdown link [title](url) or a plain URL. Try again.");
    continue;
  }

  links.push({ title, url });
  console.log(`  Added: "${title}"`);
}

rl.close();

const date = new Date().toISOString().slice(0, 10);
const slug = slugify(collectionTitle);
const filename = `${date}-${slug}.md`;
const filepath = join(import.meta.dir, "..", "links", filename);

const frontmatterLinks = links.map(l => `  - title: "${l.title}"\n    url: ${l.url}`).join("\n");
const bodySections = links.map(l => `### ${l.title}\n`).join("\n\n");

const fileContent = `---
title: "${collectionTitle}"
date: ${date}
layout: link-collection.liquid
links:
${frontmatterLinks}
---

<!-- intro -->

${bodySections}`;

writeFileSync(filepath, fileContent);
console.log(`Created ${filepath}`);

execSync(`code "${filepath}"`, { stdio: "inherit" });
