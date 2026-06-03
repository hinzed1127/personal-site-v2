---
tags:
  - post
  - week-notes
  - ADHD
  - AI
  - gardening
title: "Pulling weeds and planting seeds"
subtitle: "Using Claude Code to overcome analysis paralysis and touch grass"
date: 2026-06-03
---

As a software engineer who lives in the tech world but doesn't have that same social bubble outside of work[^1], the divide between how _I've_ approached AI[^2] and how I've seen less technical people use it has become a noticeable chasm, one which is almost certainly affecting how they view such a rapidly changing technology. With the major AI companies putting out ads showcasing use cases like "help me plan a first date" or "give me the perfect chocolate chip cookie recipe", it doesn't surprise me that so many people are deriding AI as a solution in search of a problem. This is a fundamental misunderstanding of how to explain what these technologies are good for and fails to provide examples where LLMs actually excel in helping people make progress on tasks in a meaningful way.

### Decision fatigue

I get overwhelmed by decisions all the time. As I joked with my wife in the build-up to getting married, planning a wedding was a Venn diagram of my personal hell where:

- I was making a bunch of non-trivial financial decisions (the ultimate test of my irrationally-applied frugality).
- There were innumerable options for each decision (analysis paralysis to the max).
- Many of them had to be made and committed to 6-12 months in advance (deadlines are the eternal thing that my ADHD-riddled brain simultaneously craves and avoids, especially if we're planning further down the road).

While I was actively providing my opinions on the whole day, the ultimate responsibility of making sure shit got done[^3]? That (unfairly) fell on my wife. If I were to do it all again, a wedding planner[^4] would have saved more than a little bickering and stress[^5]. Granted, few things carry the weight and significance of a once-in-a-lifetime event like a wedding, but that's not to say similar goals, decisions, and projects in my life don't stir up the same types of avoidance. For me, committing to something and taking that first step to develop some momentum is oftentimes the hardest part. 

### Fighting analysis paralysis with agents

Which brings me to a few weekends ago. After a few years where either other time commitments (the aforementioned wedding) or injuries (recovering from 2 consecutive years of hip surgeries) kept me from getting a proper spring start in the yard and garden, I'm finally able to hit the ground running this year.

While tasks like weeding require no preparation, I wanted my bigger garden goals to have a little more forethought put into them, which is where AI enters the picture. You see, as much as I tell myself to not make perfect the enemy of good, sometimes I'm so hung up on doing something the "right way"[^6] that I don't even let myself get started. In a mental battle between theory and application, I oftentimes get in my own way of _just doing the thing_. In the case of the garden, there were a few things that I was weighing in my mind:

- The annual [Hennepin County Master Gardener Spring Plant Sale](https://hennepinmastergardeners.org/events/spring-plant-sale/) taking place that Saturday morning

- A goal of using as many Minnesota native plants as possible[^7]
- In a yard with many spots already dominated by shade, I want to make a conscious effort to fill the sunnier spots with more color, ideally with blooms that last across spring, summer, and fall.
- Planning groupings of plants such that they thrive together (giving each other adequate space, complementary heights, etc)

Between the plant sale offering [a full list of what was going to be offered](/files/2026-Plant-Sale-List.pdf) and [the University of Minnesota extension](https://extension.umn.edu/lawns-and-landscapes/flowers-pollinators) as a great local resource, I had plenty to go off of for researching. Usually, this is where my worst tendencies will get the better of me, leading me to search online for hours in pursuit of the perfect plan. This time, I turned to Claude Code.

### The workflow

Up until now, I hadn't tried to use Claude Code for something that wasn't explicitly related to programming. But the "Code" in Claude Code is just additional tooling polish; it's the same Claude models, but it lives in my terminal and knows shell commands way better than me. I was initially inspired by [Maggie Appleton](https://maggieappleton.com/), whose work at the intersection of design, software, and anthropology I find consistently excellent. Here's a recent post of hers detailing Claude as a planning partner in house projects:

<blockquote class="bluesky-embed"
    data-bluesky-uri="at://did:plc:zos5kmlm4vle7b4xntem6sat/app.bsky.feed.post/3mhkvvzubkc2c"
    data-bluesky-cid="bafyreia4hhu52asfzk32bm4adasa63obx4v23av4ufu57kaqawydh2hqhq"
    data-bluesky-embed-color-mode="system">
    <p lang="en">Obsidian &amp; Claude Cowork are doing all the house management and renovation tracking that I
      don&#x27;t have brain space for right now.I ramble at Claude about things we need to fix in this very old and
      rundown Victorian we recent bought and it makes plans.Works great - both just operate on markdown.<br><br><a
        href="https://bsky.app/profile/did:plc:zos5kmlm4vle7b4xntem6sat/post/3mhkvvzubkc2c?ref_src=embed">[image or
        embed]</a></p>&mdash; Maggie Appleton (<a
      href="https://bsky.app/profile/did:plc:zos5kmlm4vle7b4xntem6sat?ref_src=embed">@maggieappleton.com</a>) <a
      href="https://bsky.app/profile/did:plc:zos5kmlm4vle7b4xntem6sat/post/3mhkvvzubkc2c?ref_src=embed">March 21, 2026
      at 6:19 AM</a>
  </blockquote>

<script async src="https://embed.bsky.app/static/embed.js" charset="utf-8"></script>

Having used Obsidian for years as a primary organizer for both daily notes and any other Markdown files, I was immediately familiar with this workflow. I fired up Claude Code in an empty directory with nothing more than a vague `PLAN.md` of rapid-fire bullet points under a number of headers for different yard projects I want to work on (trellising my raspberries, creating a small rain garden, etc). Then I told it this:

```
I'm going to a plant sale this weekend. The list of plants is in @2026-Plant-Sale-List.pdf. Help me choose good options for a south-facing wall against my house that gets full sun and will be parallel to a flagstone path. preference towards native pollinators that won't get too messy, i.e. don't obstruct the pathway over time, and things that will provide good color throughout the growing season. add this to the appropriate places in my obsidian vault. ask any clarifying questions you have
```

Some variation of the closing "ask any clarifying questions you have" statement is a strategy I've found pretty reliable in guiding outputs. It usually helps get results closer to what I want in fewer iterations. Indeed, while Claude gave a shortlist PDF of recommended plants[^8], it also had a handful of follow-up questions to help better shape what I had in mind. Since Claude does well with Markdown, when it comes back with a list of questions, I typically just answer with each of them re-pasted as Markdown quotes, followed by my responses, e.g.

```markdown
> 1. Is this a new project or part of an existing one? I see a Flagstone Pathway project already. Is this planting the beds adjacent to that path, or is this a new separate project (e.g. "South Foundation Bed" or similar)?

it's related to the flagstone pathway, since they're next to each other, but  
I would consider it separate

> 2. Approximate dimensions? How long is the wall, and roughly how deep is the planting bed between wall and path? That affects how many plants and whether tall-back / short-front layering makes sense.

There are parts that are already occupied (A/C unit, hose, etc), but free space are two rectangular blocks of 8 feet. Depth to the house is 45 inches (3 ft 9 in), so 2 blocks of 8ft x 3.75 ft, as well as a final smaller block of 2 x 3.75

> 3. Existing plants? Is there anything already planted along that wall, or is it a blank slate?

In the occupied spots, there is a large healthy peony, some sporadic ditch lilies that I can move, a large and healthy Hosta sieboldii (siebold's plantain lily), and a small bit of mountain mint I can move if needed

> 4. Height ceiling? South-facing house wall gets heat-reflected sun — some plants listed (hollyhocks, Culver's root) can hit 5-6ft. Fine with that, or do you want to cap height?

Cap heights at 5 feet to avoid a few lower windows

> 5. Any existing project this should link to? Or should I create a new South Foundation Bed (or whatever you want to call it) project note?

new project is fine

For reference, I made a rough sketch of the current situation and dimensions  
is at @~/Downloads/Path.png
```

That final `Path.png` included after my answers was just a quick sketch I made in Canva:

![Crude diagram of part of my yard](/images/posts/garden-sketch-1.png)

Was my diagram perfect? No, but it was more than good enough in getting the idea across. The fact that it was for a rectangular grid with precise measurements made it pretty easy for an LLM to quickly make sense of, and Claude came back on its first try with a more polished diagram, including a graph tracking various blooms through the seasons:

![Claude-generated diagram of that same part of my yard](/images/posts/claude-garden-diagram-1.png)

Surprised by how quickly the process yielded helpful results, I decided to tackle a second part of my yard, but in a more amorphous section set under a towering river birch. This sketch was a little more crude:

![Another crude diagram of a different part of my yard](/images/posts/garden-sketch-2.png)

As a result, the initial responses from Claude approximated things a little more roughly, but the diagram was still legible enough after a few additional edits of the generated SVG:

![Claude-generated diagram of that second part of my yard](/images/posts/claude-garden-diagram-2.png)

It took a little more finagling, but it served its purpose, and save for a brief rabbit hole trying to use an SVG editor to shape the walkway's arc a little more faithfully, I didn't sink a lot of time into it. At the end of it all, I had an Obsidian vault with those diagrams, [a clearly organized shopping list](/files/2026-Plant-Sale-Shopping-List.pdf) to take to the plant sale, and individual files outlining the different projects and plants for reference that I can update or edit on my own later.

### Maintaining curiosity and going deeper on your own

A key to all of this, I think, is that I was driving a lot of the initial context. Once Claude Code got me over the hump, I utilized resources outside of whatever the robot told me directly. A common critique of LLMs is that since they're always generating the most statistically likely output, they're not creative or original. That's valid when the use case is prose, but in this case[^9], it's what I wanted, especially if that means the garden has a better chance of succeeding. In the most cynical of examples, LLMs are a fast-track to slop; one short prompt can generate an article of anything, easily creating more noise than signal. For me, though, it was all in service of getting me away from my laptop and outside, figuring things out away from screens.

Beyond that, if I want to go deeper on anything, there are plenty of resources outside the narrow guardrails of a chatbot, too[^10]. The amount of DIY YouTube I've watched for yard and home projects is substantial. There are countless books, magazine articles, and blog posts to help people go deeper. Like anything, the LLM output isn't gospel that can't be deviated from. When I got to the plant sale, a few items on my list were already sold out. Not to worry, though. *This was an event organized and staffed by volunteers who were all master gardeners*. Any time I had a question or needed a second opinion, there was a person with a wealth of knowledge and experience to help, whom I was happy to lean on for advice. While an hour with Claude helped me get my bearings and have a strong starting point, five minutes of conversation with an actual person helped orient and convince me to try some different plants that I wouldn't have considered otherwise.

### Coda

This is, of course, just one example of how I'm finding this stuff useful for medium-sized projects; they're not tasks I'll be finished with in a single sitting, but they're also not something too large to track over weeks or months. I generated these plans on a Friday afternoon and went to the plant sale the next day. By the end of the weekend, I had weeded and mulched my yard like a madman and planted the majority of what I'd purchased. A few hours of iteration with Claude served as a catalyst to a weekend spent outside with my hands in the dirt.

![One section of freshly planted Minnesota native plants](/images/posts/plants-1.jpeg)

![Another section of freshly planted Minnesota native plants](/images/posts/plants-2.jpeg)

How are you using these tools? [Write to me](mailto:hello@danhinze.com?subject=LLM%20suggestions) with suggestions.

[^1]: It's unavoidable across all of the software industry, but I don't live in a place like San Francisco where it's all-encompassing, nor am I frequently in social settings composed of lots of programmers equally immersed in it.
[^2]: It's disappointing how AI has become an umbrella term for all sorts of things: machine learning, neural nets, natural language processing, robotics all being flattened into this single term that tells you everything and nothing. It preys on equal parts marketing hype and the general ignorance of a wider audience. For the purposes of this post, I'm specifically talking about LLMs and agentic tools (Claude Code in my case, but Codex and other tools function similarly).
[^3]: Scheduling appointments, making final decisions, booking vendors, managing communications with them, etc
[^4]: A path not taken due to aforementioned irrationally-applied frugality.
[^5]: We just celebrated our 2-year wedding anniversary. All's well that ends well, but I still wish I could have been more effective at managing avoidable sources of stress in that process.
[^6]: Which in and of itself is such a subjective and ambiguous idea
[^7]: My reasons for prioritizing natives are twofold: besides helping provide a habitat for a host of birds, pollinators, and other insects, in the long run, they should be easier to maintain. As I'm learning in year 7 of home ownership, striving for a lower maintenance yard doesn't *eliminate* maintenance, but by choosing plants that are all already thriving in a given environment, it will hopefully pay dividends to create a small system that's simultaneously better for my surroundings and requires less work for it to thrive.
[^8]: Per my initial request, it was mostly natives, along with a few "non-native sun perennials worth considering"
[^9]: A project where I was overwhelmed with options, rendering me unable to actually get started
[^10]: Prolonged back-and-forth conversations with LLMs have their own utility, but between the sycophantic tendencies that still crop up and the fact that LLMs are a never-ending well of content generation, following along sometimes seems like a Sisyphean task. Finding resources that have a defined start and stop has advantages outside of just being more human than machine.

