# Personal Site To-do's

## To-dos
- [x] Add [cloudflare email routing](https://www.cloudflare.com/developer-platform/products/email-routing/) and a site email (e.g. hello@danhinze.com)
- [ ] Add approved comments in the vein of [this](https://pketh.org/blog-comments.html)
- [x] Add anchor links for individual page headings via [markdown-it-anchor](https://github.com/valeriangalliat/markdown-it-anchor)
- [ ] Once there's a larger amount of posts that belong to different categories:
  - [x] Add tagging to posts
  - [ ] Enable filtering by tags on posts
- [ ] Add a blogroll
- [ ] Figure out better CSS organization
  - [ ] Migrate to tailwind?
    - [ ] Find best practice for 11ty (tailwind CLI, maybe?)
  - [ ] Alternatively: Andy Bell's every layout and CUBE CSS conventions
- [ ] Figure out format for `/reading` page
  - Things to include:
    - Books
    - Occasional longform articles worth referencing
    - Blog posts that I feel like commenting on?
- [x] Figure out mechanism for saving interesting links
  - Links page added in `0d23f15`
  - Dig up old cloudflare workers POC for saving links via API?
    - maybe a further improvement, but for now, there's `add-link.ts`
  - [x] add `/links`/ page once format and mechanism is determined
- [x] Add RSS feed for posts
  - [ ] ~~Integrate with Buttondown via~~ Roll my own RSS-to-email service
- [x] Add "previous post" and "next post" links to the bottom of the posts page
- add `/listening` page
  - album/song highlights
  - weekly/monthly stats (via Last.fm)
  - currently playing (via Last.fm)
- add biome.js for linting and formatting

## Optional to-dos I haven't decided if I want yet
- [ ] Add more bite-sized feed a la MacWright "micro" page or thesephist stream, etc
- [ ] Add a `/now` page [a la Derek Sivers](https://nownownow.com/about)

## More recent (6/2/26)
- [ ] Instagram-style image carousel on posts when multiple photos are posted together
- fix failing tests (or remove if they're not needed?)
