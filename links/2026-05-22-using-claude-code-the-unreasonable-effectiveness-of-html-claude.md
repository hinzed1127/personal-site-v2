---
title: "Using Claude Code: The unreasonable effectiveness of HTML"
link: https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html
date: 2026-05-22
---

As a long-time [Obsidian](https://obsidian.md/) user, the convention of using markdown as way of generating more structured output from LLMs was an easy habit for me to adopt. This article from the Anthropic team gives a lot of great ideas in taking that further, showcasing HTML as a more expressive canvas for one-off outputs.

Previously, the only time I discovered this approach was by accident. I've slowly been researching effects pedals to use with saxophone and wanted some guidance on building out a small board/effects chain. After a little back on forth, I gave Claude this prompt:

```
assuming I get this setup gear, including a pedalboard, can you generate a diagram for an initial setup that includes the DL4, the gamechanger audio PLUS pedal, the Meris Hedra (along with a midi controller for the hedra), maybe the shallow water (or similar), and anything you deem essential for a starting setup?
```

and it came back with this:
![JSX-based diagram of a proposed pedalboard setup for a saxophonist](/images/posts/pedalboard-diagram.png)

Without me asking, it even included some interactivity: clicking on individual pedals/gear in the top gave a blurb on the pedal with any additional notes (e.g. in the above screenshot, it's currently got the Eventide MixingLink selected). 

This particle example was with React (and at least one version removed from the latest models), but I have no doubt it could generated something just as detailed and interactive with an HTML file and inline JavaScript, which is even more shareable (no dependencies, just a raw HTML file).

Markdown is great, but with the volume that LLMs generate, it still doesn't always feel like the best vehicle for workflows that would benefit from a more visual, less text-heavy, approach. I'm looking forward to playing around with this some more.
