#!/usr/bin/env bun

import { execSync } from "child_process";
import { createInterface } from "readline";
import { writeFileSync } from "fs";
import { join } from "path";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string) => new Promise<string>((res) => rl.question(q, res));

const date = new Date().toISOString().slice(0, 10);

const rawSlug = await ask("File name slug (kebab-case, no date prefix): ");
const title = await ask("Post title (for frontmatter): ");
rl.close();

const slug = rawSlug
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const filename = `${date}-${slug}.md`;
const filepath = join(import.meta.dir, "..", "posts", filename);

const content = `---
tags:
  - post
title: "${title}"
date: ${date}
---

`;

writeFileSync(filepath, content);
console.log(`Created ${filepath}`);

execSync(`code --wait "${filepath}"`, { stdio: "inherit" });
