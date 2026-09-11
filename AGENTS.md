## Project Overview

Personal blog/site built with Eleventy (static site generator) + Netlify Functions. Dev server runs via Netlify CLI to proxy functions locally.

## Commands

```bash
bun run start     # Dev server on port 8888 (netlify dev, proxies functions)
bun run build     # Build static site → _site/
bun run test      # Run vitest test suite
bun run add-post  # Scaffold a new blog post
bun run add-link  # Scaffold a new link
bun run add-album # Scaffold a new album entry
```

## Architecture

- `posts/` — blog posts (Markdown)
- `links/` — link collection entries
- `listening/` — music listening entries
- `_includes/` — Liquid templates (base.liquid, post.liquid, etc.)
- `_data/` — Eleventy global data (metadata.json, listening.ts)
- `netlify/functions/` — Netlify Functions (listening.ts — Last.fm API proxy)
- `.eleventy.js` — Eleventy config: collections, filters, plugins, transforms
- `_site/` — build output (gitignored)

## Environment Variables

```
LASTFM_API_KEY=    # Required for /api/listening endpoint
LASTFM_USERNAME=   # Required for /api/listening endpoint
```

Copy `.env.example` to `.env`.

## Package management

Use `pnpm` to install/manage dependencies (`pnpm install`, `pnpm add`, etc.). `netlify-cli` is a local dev dependency — use `pnpm run start` or `pnpm exec netlify` rather than any globally installed `netlify`.

## Bun (runtime)

Use Bun to run scripts and files instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun run test` instead of `bun test`, `jest`, or `vitest` directly
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun run <script>` instead of `npm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## Testing

This project uses vitest. Run tests with `bun run test`.

## Design specs

Design specs live in `docs/superpowers/specs/` and are gitignored — do not commit them.

## Gotchas

- Posts with `draft: true` in frontmatter are excluded from production builds but visible in dev

## Post tags

Posts use Eleventy's `tags` frontmatter for two purposes: the `post` tag is required for collection membership (`collections.posts`) and must never be displayed. All other tags (e.g. `week-notes`, `music`, `books`) are semantic labels intended for display. Always filter out `post` before rendering tags. Use the `displayTags` Eleventy filter for this.
