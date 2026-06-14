# Promotion Strategy & Channel Research — aip.js

> **Product:** aip.js — open-source TypeScript SDK for Agentic Engine Optimization (AEO).
> **Elevator pitch:** "SEO for AI agents." aip.js auto-infers JSON-RPC tool schemas from your website's semantic HTML, letting AI agents interact with your site safely and intelligently — without scraping fragile DOM.

---

## 1. Developer Communities

### 1.1 Hacker News

**URL:** https://news.ycombinator.com/

| Factor | Recommendation |
|---|---|
| **Best day** | Tuesday–Thursday |
| **Best time** | 7:00–9:00 AM ET (12:00–14:00 UTC) — catches East Coast morning + European afternoon |
| **Second window** | 9:00–11:00 PM ET (midnight UTC) — late night Pacific time surge |
| **Post type** | **Show HN** (for demo/live site + open source). Use "Show HN: aip.js — give your website an API for AI agents" |
| **Title formula** | `Show HN: aip.js — [what it does in <8 words]` |
| **Title examples** | `Show HN: aip.js — SEO for AI agents (auto-infers JSON-RPC tools from your HTML)` |
| | `Show HN: aip.js — let AI agents use your website without scraping` |
| | `AEO: What happens when AI agents replace search crawlers?` (discussion/essay angle) |

**What gets upvoted on HN:**
- **Demos** — Link to a live interactive demo (aip.js demo micro-site). Live demos beat articles 3:1.
- **Open source** — Clear GitHub link in first comment. Include README highlights.
- **Technical depth** — Show the architecture: CustomEvents bridge, WebMCP compatibility, risk classification model, auto-inference algorithm.
- **Contrarian theses** — "SEO is dying; AEO is the replacement" — provocative-but-defensible claims get discussion.
- **First comment** — Post as soon as your link goes live. Write 2–3 paragraphs: who you are, why you built it, what's novel, what's next. Include links to GitHub, docs, demo.

**Avoid:**
- Marketing-speak. HN detects it instantly.
- Paywalled content or email-gates.
- "Launch" announcements (use Show HN instead).

**Pre-launch checklist:**
1. Ensure GitHub README is polished (badges, quick-start, GIF/diagram).
2. Demo micro-site must be live and functional.
3. Add an `hn.agentic-js.dev` CNAME redirect or `?ref=hn` query param to track traffic.
4. Have teammates ready to upvote within the first hour (organic-looking; don't coordinate suspiciously).
5. Monitor and reply to every comment within 30 minutes.

---

### 1.2 Reddit

#### r/webdev — 1.2M members

- **URL:** https://reddit.com/r/webdev/
- **Rules:** No self-promotion on weekdays. Showoff Saturday is the official self-promo day.
- **Best post type:** "Showoff Saturday" post with `[Showoff Saturday]` title prefix.
- **Post format:** Short title + body with links to demo, GitHub, and a "what I learned building this" section.
- **Title:** `[Showoff Saturday] aip.js: I built an SDK that gives any website an AI-agent-friendly API`

#### r/javascript — 2.4M members

- **URL:** https://reddit.com/r/javascript/
- **Rules:** Must be JS/TS related. Self-promo allowed if <1/10 of your overall contributions. Link posts + comments.
- **Best post type:** Link post to the GitHub repo or a technical blog write-up.
- **Title:** `aip.js — TypeScript SDK for Agentic Engine Optimization (AEO). Auto-infers JSON-RPC tools from semantic HTML. WebMCP-compatible.`

#### r/programming — 5.9M members

- **URL:** https://reddit.com/r/programming/
- **Rules:** Strictly programming content. No memes. Link posts preferred. Self-promo must be <10% of activity.
- **Best post type:** In-depth blog post or technical deep-dive. Link to a dev.to/Medium article, not directly to GitHub.
- **Title:** `Agentic Engine Optimization: What happens when AI agents replace search crawlers?`

#### r/opensource — 2.1M members

- **URL:** https://reddit.com/r/opensource/
- **Rules:** Must be open source (Apache 2.0 ✓). Link to GitHub.
- **Best post type:** Release announcement.
- **Title:** `[Apache 2.0] aip.js v0.1 — Give websites an API for AI agents with auto-inference`

#### r/SEO — 230K members

- **URL:** https://reddit.com/r/SEO/
- **Rules:** SEO professionals. Tolerates tool announcements if genuinely novel.
- **Best post type:** Discussion starter: "Is AEO going to replace SEO?" or "What are you doing about AI agents?"
- **Warning:** This sub can be hostile to blatant product plugs. Frame as an industry trend discussion, mention aip.js in the body as an example.

#### r/SaaS & r/SideProject — combined ~1M

- **URLs:** https://reddit.com/r/SaaS/ | https://reddit.com/r/SideProject/
- **Rules:** Loose. Self-promo welcomed if you share lessons/methodology.
- **Best post type:** "How I built" story.
- **Title:** `I built an open-source SDK that adds AI agent compatibility to any website — here's how`

**General Reddit strategy:**
- Post at **9:00–11:00 AM ET** Tuesday–Thursday.
- Cross-post sparingly (max 2–3 subs; Reddit discourages spam).
- Always add a comment explaining the "why" and "how" within 5 minutes of posting.
- Track traffic with `?ref=reddit_webdev` etc. UTM params.

---

### 1.3 Dev.to / Hashnode

#### Dev.to — 1.5M+ developers

- **URL:** https://dev.to/
- **Tags to use:** `#javascript` `#typescript` `#webdev` `#ai` `#opensource` `#tutorial` `#showdev`
- **Best post type:** Tutorial-style post showing exactly how to integrate aip.js into a website. Use code snippets from the README quick-start.
- **Series:** Create a Dev.to Series called "Agentic Engine Optimization (AEO)" with:
  1. "What is AEO and Why Should You Care?" (trend post)
  2. "Getting Started with aip.js — Auto-Inference in 5 Lines" (tutorial)
  3. "Securing AI Agent Access with HITL in aip.js" (security deep-dive)
  4. "aip.js E-Commerce Plugin: Let AI Agents Shop on Your Site" (vertical deep-dive)
- **Cross-post:** Dev.to supports canonical URLs — you can publish the *same* content on your own blog and set `canonical_url` to avoid duplicate content penalties.
- **Best posting time:** Monday morning 8:00–10:00 AM ET (platform's weekly digest picks up early-week posts).

#### Hashnode — 500K+ developers

- **URL:** https://hashnode.com/
- **Advantage:** Custom domain support, built-in newsletter, better SEO juice than Dev.to.
- **Strategy:** Mirror your Dev.to content on Hashnode with canonical URLs pointing to your own domain (once you have a blog). Hashnode's community is smaller but more engaged for backend/TypeScript content.

**Cross-posting strategy:**
```
Primary: Your own blog (agentic-js.dev/blog) with canonical URL
├── Dev.to (import with canonical_url pointing to your blog)
├── Hashnode (import with canonical_url)
└── Medium (import with canonical_url) — optional, lower ROI
```

---

### 1.4 Product Hunt

**URL:** https://www.producthunt.com/

| Factor | Recommendation |
|---|---|
| **Day** | Tuesday, Wednesday, or Thursday |
| **Time** | Launch at 12:01 AM PT (3:01 AM ET) — resets the leaderboard |
| **Hunter** | Find a hunter relevant to developer tools (e.g., top hunters in "Developer Tools" category). Alternative: self-maker launch (simpler, no dependency). |
| **Category** | "Developer Tools" + "Open Source" |
| **Tagline** | `SEO for AI agents — auto-infers structured APIs from your website's HTML` |
| **Maker comment** | Essential. Write a heartfelt first comment about why you built it, what problem it solves, and what's coming next. Include GIF/demo link. |
| **Cost** | Free to launch. Paid "Ship" features below. |

**Pre-launch prep (do 2 weeks before):**
1. Create Product Hunt account and start engaging (upvotes, comments on other launches).
2. Build a "Coming Soon" page on Product Hunt at least 1 week ahead.
3. Collect "Notify Me" subscribers — these get an email when you launch.
4. Prepare assets: 5 screenshots/GIFs (1270×760), 1 demo video (YouTube/Vimeo), maker photo, icon (240×240).
5. Write the maker comment, tagline, description (max 260 chars), and first comment drafts ahead of time.
6. Line up 10–15 friends/colleagues to upvote and leave genuine comments in the first 2 hours.
7. Do NOT use upvote bots or paid upvote services — PH detects and bans.

**Product Hunt "Ship" (paid):**
- **URL:** https://www.producthunt.com/ship
- **Cost:** ~$79/month (billed annually $59/mo)
- **Features:** Scheduled launches, analytics, "Coming Soon" page with email collection, video upload, custom badges.
- **Verdict:** Worth one month for the launch; cancel after.

---

## 2. Newsletters

### 2.1 JavaScript Weekly

- **URL:** https://javascriptweekly.com/
- **Audience:** ~200K JavaScript developers
- **Submission:** https://javascriptweekly.com/submit/ or email `submit@javascriptweekly.com`
- **Acceptance criteria:**
  - Relevant to a broad JS audience
  - Timely (new release, major update, new project)
  - High quality (good docs, polished README, working demo)
- **Best angle:** "aip.js v0.1 released — TypeScript SDK for Agentic Engine Optimization"
- **Typical slot:** "Libraries & Tools" section (bottom half of newsletter)
- **Timing:** Submit 1–2 weeks before desired publication. Newsletter goes out Friday AM ET.

### 2.2 Frontend Focus

- **URL:** https://frontendfoc.us/
- **Audience:** ~180K frontend developers
- **Submission:** https://frontendfoc.us/submit/ or email `submit@frontendfoc.us`
- **Acceptance criteria:** Similar to JS Weekly, but frontend-leaning.
- **Best angle:** Emphasize DOM auto-inference, CustomEvents bridge, HITL modals, UI mirroring.
- **Title:** `aip.js: expose your site's capabilities to browser AI agents via auto-inferred tool schemas`

### 2.3 Node Weekly

- **URL:** https://nodeweekly.com/
- **Audience:** ~100K Node.js developers
- **Submission:** https://nodeweekly.com/submit/
- **Angle:** npm package release, SPA support, backend security model.
- **Fit:** Moderate — aip.js is primarily a browser SDK. Still worth submitting for the "Tools" slot.

### 2.4 TLDR Web Dev

- **URL:** https://tldr.tech/webdev
- **Audience:** ~300K web developers (fast-growing, digest format)
- **Submission:** https://tldr.tech/webdev/sponsorship or find the editor contact at `webdev@tldr.tech`
- **Style:** TLDR is curated, not user-submitted. They pick up trending projects themselves.
- **Strategy:** Get visibility elsewhere first (HN, Reddit, Twitter), and TLDR may pick it up organically.

### 2.5 TLDR InfoSec

- **URL:** https://tldr.tech/infosec
- **Audience:** ~250K security professionals
- **Angle:** aip.js's HITL security model, prompt injection sanitization, risk classification. Pitch as "secure-by-default AI agent access."
- **Strategy:** Similar to TLDR Web Dev — organic pickup more likely than cold submission.

### 2.6 Console.dev

- **URL:** https://console.dev/
- **Audience:** ~60K developers (curated, high-quality open-source tools)
- **Submission:** https://console.dev/submit/
- **Acceptance criteria:** Exceptionally high bar. Must be genuinely novel and well-executed.
- **Best angle:** "aip.js — the first SDK for Agentic Engine Optimization (AEO). Apache 2.0."
- **Tip:** Console.dev rewards projects with excellent documentation. Polish the README, add architecture diagrams, and include a live demo link.

### 2.7 SEO / Digital Marketing Newsletters

| Newsletter | URL | Audience | Angle |
|---|---|---|---|
| **Search Engine Roundtable** | https://www.seroundtable.com/ | ~50K SEO professionals | AEO trend story — what happens when AI agents replace crawlers? |
| **SEO Notebook** (Steve Toth) | https://seonotebook.com/ | ~15K SEOs | "AEO is the next SEO" — technical guest post angle |
| **The SEO MBA** (Tom Critchlow) | https://seomba.com/ | ~10K senior SEOs | Strategic piece: AEO as an evolution of structured data/schema.org |
| **Search Engine Journal** | https://www.searchenginejournal.com/ | Major SEO publication | Pitch a contributed article (see §4 below) |
| **Moz Top 10** | https://moz.com/top10 | Bi-weekly, influential | Hard to get into; needs industry buzz first |

---

## 3. Social Media

### 3.1 Twitter / X

**Key accounts to engage (web dev + AI crossover):**

| Account | Handle | Followers | Why |
|---|---|---|---|
| **Theo - t3.gg** | @theo | 200K+ | Influential web dev voice, covers new tools |
| **Lee Robinson** | @leeerob | 180K+ | VP DevRel at Vercel, Next.js |
| **Guillermo Rauch** | @rauchg | 150K+ | Vercel CEO, interested in web platform evolution |
| **Tanner Linsley** | @tannerlinsley | 80K+ | TanStack creator, tooling authority |
| **Kent C. Dodds** | @kentcdodds | 200K+ | Web educator, open source champion |
| **Dan Abramov** | @dan_abramov | 350K+ | React core (less active now but highly followed) |
| **Swyx** | @swyx | 70K+ | AI + developer tools essayist |
| **Simon Willison** | @simonw | 80K+ | AI + web tools, Datasette, LLM expert |
| **Ben Thompson** | @benthompson | 300K+ | Stratechery, covers tech platform shifts |
| **Cyrus Shepard** | @CyrusShepard | 80K+ | SEO expert, schema.org advocate |

**AI-specific accounts:**
| Account | Handle | Followers | Why |
|---|---|---|---|
| **Andrej Karpathy** | @karpathy | 1M+ | AI educator, talks about agentic AI |
| **Yohei Nakajima** | @yoheinakajima | 100K+ | AI agent builder, BabyAGI creator |
| **Riley Goodside** | @goodside | 50K+ | Prompt engineering, agent design |
| **Matt Shumer** | @mattshumer_ | 60K+ | AI agent tools, HyperWrite |

**Hashtag strategy:**
```
Primary (always):   #AEO #AgenticSEO #WebDev #TypeScript #OpenSource
Secondary (context): #AIAgents #MCP #WebMCP #BrowserAI #JSONRPC
Trending (if relevant): #buildinpublic #indiedev #devcommunity
```

**Thread format (what works on Twitter):**

**Option A — The "Big Claim" Thread** (5–7 tweets):
```
1/ The era of SEO is ending. What comes next? AEO — Agentic Engine Optimization.

Meet aip.js: the first open-source SDK that lets websites expose 
structured APIs to AI agents. Auto-magically.

2/ Here's the problem: AI agents (ChatGPT, Claude, Gemini) are starting to 
browse the web. But they scrape raw HTML — fragile, unpredictable, and dangerous.

3/ aip.js solves this. Drop a script tag on your site and it:
→ Auto-infers tools from your search bars, filters, and forms
→ Generates clean JSON-RPC schemas
→ Adds HITL security for mutations like "add to cart"

4/ Example: an e-commerce site with aip.js
→ search_products(q, category, sortBy)  ← auto-inferred SAFE tool
→ add_to_cart(productId) ← HIGH_RISK, requires human approval ✅

5/ It's fully WebMCP-compatible, 100% open source (Apache 2.0), 
and works with React, Vue, Next.js, and plain HTML.

6/ [Link to demo] [Link to GitHub]

7/ SEO optimized websites for crawlers. AEO optimizes websites for agents.
The web is about to change. Be early.
```

**Option B — The "Demo GIF" Post** (single tweet + GIF):
- Record a 30-second screen capture of the aip.js demo micro-site.
- Tweet: "I built an SDK that lets any website expose itself to AI agents. Auto-infers search, filter, and action tools from your HTML. AEO = SEO for AI agents. [GIF] [GitHub link]"
- GIF content: Left panel "without aip.js" showing the agent confused, right panel "with aip.js" showing structured tool schemas.

**Engagement strategy:**
- Reply to every comment. Twitter's algorithm heavily weights conversation.
- Engage with other threads in the AI/webdev space 2–3 days before your launch to warm up your timeline.
- Tag 2–3 relevant accounts in a reply (not the main tweet) if they're likely to find it interesting.
- DON'T cold-DM influencers. Instead, reply genuinely to their posts for a few days, THEN share your project if relevant to their thread.

**Best posting time:** Monday–Thursday 9:00–11:00 AM ET or 12:00–2:00 PM ET (lunchtime scroll).

---

### 3.2 LinkedIn

**Strategy:** LinkedIn is high-signal for B2B/enterprise adoption. aip.js's value prop ("secure your site for AI agents") resonates with engineering managers and CTOs.

**Post vs. Article:**
- **Post** (short, <150 words): For announcements, demo links, quick takes. E.g., "We just open-sourced aip.js — the first SDK for Agentic Engine Optimization. Let AI agents interact with your website safely. [demo link] [GitHub link]"
- **Article** (long-form, 800–1500 words): For positioning pieces. E.g., "Why Every Website Will Need an AI-Agent API by 2027." Publish as a LinkedIn Article and cross-link from Twitter/Reddit.

**Relevant LinkedIn groups:**
- Developer Tools & Platforms: https://www.linkedin.com/groups/ (search)
- AI & Machine Learning Engineers
- CTO Network
- SEO Professionals
- Web Performance & Web Platform

**Best practices:**
- Tag 3–5 relevant people (@mention) in the comments, not the post body.
- Use a clean header image (1200×627) with the aip.js logo and tagline.
- Post Tuesday–Thursday 8:00–10:00 AM in your target time zone.
- Personal account posts outperform company page posts 5:1. Use your founder/lead dev account.

---

### 3.3 YouTube

**Demo video strategy:**

| Factor | Recommendation |
|---|---|
| **Ideal length** | 6–12 minutes (tutorials), 2–3 minutes (teasers/demos) |
| **Teaser video** | "aip.js in 120 seconds" — fast-paced screen capture with voiceover showing the before/after split panel |
| **Tutorial video** | "How to make your website AI-agent-ready in 5 minutes" — walk through install → auto-inference → deploy |
| **Deep dive** | "aip.js Architecture: Auto-Inference, HITL Security, and WebMCP" — 15–20 minute technical walkthrough |

**Thumbnail formula:**
- Left side: Confused robot looking at messy HTML
- Right side: Happy robot reading clean JSON-RPC schemas
- Text overlay: "SEO for AI Agents?" or "AEO explained"
- Colors: Dark background, purple/indigo accent (matches aip.js branding)

**Channels to reach out to (for coverage/reviews):**
| Channel | Subscribers | Angle |
|---|---|---|
| **Fireship** | 3M+ | "aip.js in 100 seconds" — code report format |
| **Theo - t3.gg** | 400K+ | Developer tool reviews |
| **Jack Herrington** | 150K+ | TypeScript/web dev deep dives |
| **Beyond Fireship** | 500K+ | Long-form tech analysis |
| **Web Dev Simplified** | 1.5M+ | Beginner-friendly tutorials |
| **AI Jason** | 150K+ | AI tools for non-technical audiences |
| **Matt Wolfe** | 600K+ | AI tools roundup (broader audience) |

**Self-publish strategy:**
- Create a 30-second Short/Reel version of the demo (vertical 9:16).
- Post to YouTube Shorts, TikTok, and Instagram Reels simultaneously.
- Use trending audio that fits the "tech reveals" vibe.

---

## 4. SEO / AEO Publications

### 4.1 Search Engine Journal

- **URL:** https://www.searchenginejournal.com/
- **Guest post / contributed article:** https://www.searchenginejournal.com/contribute/
- **Requirements:** Original, actionable, expert-level content. No blatant product pitches — education first.
- **Suggested topics:**
  - "Agentic Engine Optimization (AEO): The Evolution Beyond SEO"
  - "Schema.org, MCP, and AEO: Preparing Your Site for AI Agents"
  - "The Rise of AI Browsing: What Website Owners Need to Know"

### 4.2 Search Engine Land

- **URL:** https://searchengineland.com/
- **Contribute:** https://searchengineland.com/contact — submit via editorial contact form
- **Similar to SEJ:** Education-first, no direct promotions. Pitch as industry analysis with aip.js mentioned as one example among several.

### 4.3 Moz Blog

- **URL:** https://moz.com/blog
- **Contribute:** Generally invite-only or internal. Harder to get into.
- **Strategy:** Build relationships first (share their articles, comment, attend MozCon). Pitch after establishing credibility.

### 4.4 AI/Agent-Specific Blogs

| Publication | URL | Angle |
|---|---|---|
| **The Sequence** | https://thesequence.substack.com/ | AI/ML engineering newsletter. Pitch a guest post on agent-web interaction. |
| **The Gradient** | https://thegradient.pub/ | Long-form AI essays. Too academic for a product pitch, but good for the AEO concept piece. |
| **Import AI** (Jack Clark) | https://jack-clark.net/ | AI policy/trends newsletter. Hard to get into; needs major buzz. |
| **Latent Space** | https://www.latent.space/ | AI engineering podcast/newsletter. Covers agents, tools, MCP. Pitch: "How we built aip.js to bridge websites and AI agents." |
| **Ben's Bites** | https://bensbites.beehiiv.com/ | AI news digest, 200K+ subs. Curated, not pitched. Get on their radar via other channels first. |

### 4.5 Schema.org / Web Standards Blogs

- **Web Almanac** (HTTP Archive) — if they do a 2026 edition, pitch an "AI Agent Compatibility" chapter.
- **W3C WebMCP Community Group** — https://github.com/webmachinelearning/webmcp — aip.js is already WebMCP-compatible. Engage in the community, contribute to discussions, and the project will be referenced organically.

---

## 5. Cost Considerations

### 5.1 Paid Promotion Options

| Channel | Format | Cost | Reach Estimate | ROI Assessment |
|---|---|---|---|---|
| **Reddit Ads** | Sponsored post in r/programming, r/webdev, r/javascript | $0.50–$2.00 CPC, $5 minimum/day | 1K–5K clicks for $100–$500 | **Medium.** Redditors dislike ads. Use only for retargeting or "promoted" with a genuinely useful angle. |
| **Twitter/X Ads** | Promoted tweet (follower or website click campaign) | $0.50–$3.00 CPC | 2K–10K impressions for $50–$100 | **Low-Medium.** Good for amplifying a viral thread. Poor for cold discovery. |
| **Google Ads** | Search ads on "AEO tools," "agentic web," "AI agent website API" | $1–$5 CPC (low competition niche) | 100–500 clicks for $100 | **Low.** These are still obscure keywords, so volume is tiny. Not worth it at launch. |
| **LinkedIn Ads** | Sponsored content targeting CTOs/engineering managers | $5–$10 CPC | 200–500 clicks for $500 | **Low for launch.** Better for enterprise sales pipeline after product-market fit. |
| **Sponsored newsletter** | JS Weekly, TLDR, Console.dev sponsor slots | See §5.2 below | 10K–50K opens | **High.** Targeted developer audience. Best ROI for launch promo. |
| **Carbon Ads** | Display ad on dev sites (npmjs.com, dev.to, Stack Overflow) | ~$300–$500/month CPM | 50K–100K impressions/month | **Medium.** Brand awareness play, not direct conversion. |

### 5.2 Newsletter Sponsorship Pricing (Estimates)

| Newsletter | Format | Approximate Cost | Subscribers |
|---|---|---|---|
| **JavaScript Weekly** | Dedicated sponsor slot (#1 of 4) | ~$2,500–$4,000 | ~200K |
| **Frontend Focus** | Sponsor slot | ~$2,000–$3,500 | ~180K |
| **Node Weekly** | Sponsor slot | ~$1,500–$2,500 | ~100K |
| **TLDR Web Dev** | 1 primary ad placement | ~$3,000–$6,000 | ~300K |
| **TLDR InfoSec** | 1 primary ad placement | ~$4,000–$7,000 | ~250K |
| **Console.dev** | Sponsor slot (1/month max) | ~$1,500–$3,000 | ~60K (highly engaged) |
| **Bytes.dev** | Sponsor slot | ~$1,200–$2,500 | ~100K |
| **This Week in React** | Sponsor slot | ~$800–$1,500 | ~35K |

**Sponsorship strategy:** If budget is tight, sponsor ONE newsletter that best matches your audience (JavaScript Weekly for developer adoption) and rely on organic submissions for the rest.

### 5.3 Product Hunt Launch Budget

| Item | Approximate Cost | Notes |
|---|---|---|
| Product Hunt Ship | $79/month | One month sufficient |
| Hunter fee (if using a top hunter) | $0–$500 | Many hunters do it free for interesting products; some charge |
| Demo GIF creation | $0 (self-made with OBS/QuickTime) to $500 (freelance animator) | Self-made is totally fine for a dev tool |
| Product Hunt video (90s) | $0 (self-recorded screen capture + voiceover) to $2,000 (produced) | Self-made with Loom or OBS recommended |
| Social graphics (5 screenshots) | $0 (screenshots) to $300 (designed) | Screenshots are expected for dev tools |
| **Total Launch Cost** | **$79–$2,879** | Realistic: **$79–$500** |

### 5.4 Modest Launch Budget Summary

**Scenario: Bootstrapped open-source launch (recommended for now)**

| Item | Cost |
|---|---|
| Product Hunt Ship (1 month) | $79 |
| Domain + basic landing page | $30–$50/year |
| 1 sponsored newsletter (e.g., Bytes.dev or This Week in React) | $800–$1,500 |
| 1 modest Reddit Ads test | $100 |
| **TOTAL** | **~$1,000–$1,729** |

**What gives the best ROI at launch:**
1. **Show HN post** — Free. If it hits front page, worth more than $5K in paid ads.
2. **One good Twitter thread** — Free. A viral dev-tool thread hits 100K+ organic impressions.
3. **Dev.to + Hashnode tutorial series** — Free. Cumulative SEO value for years.
4. **Product Hunt launch** — $79. Can drive 500–2,000 upvotes and 5K–10K visitors if it hits top 5.
5. **Sponsored newsletter** — $800–$1,500. 2K–5K direct GitHub stars if the product resonates.

**NOT recommended at launch:**
- Google Ads / LinkedIn Ads (low intent for an unknown concept)
- Paid influencer sponsorships (too expensive, $2K–$10K+ per post)
- Conference sponsorships (better after you have adoption and revenue)

---

## 6. Launch Sequence (Recommended Timeline)

### Phase 0: Pre-Launch (2 weeks before)
- [ ] Polish GitHub README (badges, GIF, architecture diagram, quick-start).
- [ ] Deploy demo micro-site (live, functional, polished).
- [ ] Draft and queue Dev.to/Hashnode tutorial posts (3–4 articles).
- [ ] Create Product Hunt "Coming Soon" page on Ship.
- [ ] Write draft Show HN post, first comment, and Twitter thread.
- [ ] Set up `?ref=hn|ph|reddit|twitter` UTM tracking on the landing page.
- [ ] Engage on Twitter: reply to AI/webdev accounts, build rapport.

### Phase 1: Launch Week
- [ ] **Monday:** Publish Dev.to article #1 ("What is AEO?"). Post on r/webdev, r/javascript.
- [ ] **Tuesday, 7:00 AM ET:** Post Show HN. Tweet the thread. Reply to all comments.
- [ ] **Wednesday:** Publish Dev.to article #2 ("Getting Started with aip.js"). Cross-post to Hashnode.
- [ ] **Thursday, 12:01 AM PT:** Launch on Product Hunt. Tweet about it. Reply to every PH comment.
- [ ] **Friday:** Follow-up Twitter thread: share HN/PH results, lessons learned, next features.

### Phase 2: Post-Launch (2–4 weeks after)
- [ ] Submit to JavaScript Weekly, Frontend Focus, Node Weekly.
- [ ] Submit to Console.dev.
- [ ] Publish Dev.to article #3 ("aip.js Security: HITL Explained").
- [ ] Pitch SEO publications (SEJ, SEL) on the AEO trend (not the product directly).
- [ ] Post a "1 month later" retrospective on r/opensource and Dev.to.

### Phase 3: Ongoing
- [ ] Weekly social media presence: share integration examples, user stories, AEO news.
- [ ] Monthly deep-dive blog posts on your own domain.
- [ ] Engage in WebMCP community group discussions on GitHub.
- [ ] Track mentions/stars/forks. Celebrate milestones publicly.
- [ ] Consider a modest newsletter sponsorship (JS Weekly) at v0.5 or v1.0 launch.

---

## Appendix: Useful Links

| Resource | URL |
|---|---|
| Hacker News submit | https://news.ycombinator.com/submit |
| Show HN rules | https://news.ycombinator.com/showhn.html |
| Product Hunt | https://www.producthunt.com/ |
| Product Hunt Ship | https://www.producthunt.com/ship |
| Dev.to | https://dev.to/ |
| Hashnode | https://hashnode.com/ |
| JavaScript Weekly submit | https://javascriptweekly.com/submit/ |
| Frontend Focus submit | https://frontendfoc.us/submit/ |
| Node Weekly submit | https://nodeweekly.com/submit/ |
| Console.dev submit | https://console.dev/submit/ |
| Reddit r/webdev | https://reddit.com/r/webdev/ |
| Reddit r/javascript | https://reddit.com/r/javascript/ |
| Reddit r/programming | https://reddit.com/r/programming/ |
| Reddit r/opensource | https://reddit.com/r/opensource/ |
| Reddit r/SEO | https://reddit.com/r/SEO/ |
| Search Engine Journal contribute | https://www.searchenginejournal.com/contribute/ |
| Search Engine Land contact | https://searchengineland.com/contact |
| WebMCP Community Group | https://github.com/webmachinelearning/webmcp |
| Latent Space podcast | https://www.latent.space/ |

---

*Last updated: 2026-06-14 — research phase. Adjust based on actual launch timing and product maturity.*
