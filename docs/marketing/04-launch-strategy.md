# Launch Strategy & Cost Summary

> **aip.js** — Agentic Engine Optimization (AEO) SDK
> *Strategy synthesis — pulls together distribution, positioning, and promotion research*

---

## Total Cost Summary

| Category | Item | Cost | Frequency |
|----------|------|------|-----------|
| **Distribution** | npm organization (unlimited public packages) | $0 | Forever |
| **Distribution** | CDN (jsDelivr, unpkg, esm.sh) | $0 | Forever |
| **Distribution** | GitHub (repo, Actions CI, Pages) | $0 | Forever |
| **Docs Hosting** | Cloudflare Pages (recommended) | $0 | Forever |
| **Docs Hosting** | Custom domain `aipjs.dev` (optional) | $12/yr | Annual |
| **Promotion** | Product Hunt Ship (optional power tools) | $79 | One-time |
| **Promotion** | Reddit Ads (1-week test campaign) | $200–500 | One-time |
| **Promotion** | Newsletter sponsorships (targeted) | $0–7,000 | Optional |
| **Promotion** | Twitter/X organic | $0 | Ongoing |
| **Promotion** | Developer community posts (HN, Reddit, Dev.to) | $0 | Ongoing |
| **TOTAL (minimum viable launch)** | | **$0–$79** | |
| **TOTAL (recommended modest launch)** | | **$291–$579** | |
| **TOTAL (aggressive launch)** | | **$1,000–$2,000** | |

### What Each Tier Gets You

| Tier | Spend | What You Get |
|------|-------|-------------|
| **$0** | Free | npm + CDN + GitHub Pages + organic community posts. Everything works. |
| **$79** | Product Hunt Ship | Above + PH scheduled launch with analytics + newsletter inclusion |
| **$291–$579** | PH Ship + Reddit Ads | Above + targeted ad campaign to r/webdev + r/javascript |
| **$1,000–$2,000** | Aggressive | Above + 1 newsletter sponsorship (JS Weekly or Console.dev) + domain |

### Recommendation

Start at **$0**. Ship to npm, post to HN and Reddit organically. If those get traction, invest in Reddit Ads to amplify. Only buy newsletter sponsorships if there's clear signal (stars > 200, downloads > 1,000/week).

---

## Pre-Launch Checklist (2 Weeks Before)

### Code & Package
- [ ] Fix namespace: `@agentic-js/plugin-ecommerce` → `@aipjs/plugin-ecommerce`
- [ ] Add `publishConfig: {"access": "public"}` to all workspace package.json files
- [ ] Add `"files": ["dist"]` to all package.json files
- [ ] Create `@aipjs` npm organization (free)
- [ ] Create GitHub repo `aipjs/aip.js` with polished README
- [ ] Configure GitHub Actions: CI (build + test) on every push
- [ ] Configure GitHub Actions: publish to npm on version tag
- [ ] Push to GitHub, verify CI passes

### Demo & Docs
- [ ] Demo micro-site is live and functional (already built)
- [ ] Polish the demo: verify both scenarios, HITL modal, terminal modes all work
- [ ] Create a 2-minute screen recording (GIF or MP4) showing the split-panel demo
- [ ] Write the anchor blog post: "Introducing aip.js — Agentic Engine Optimization for the Web"
- [ ] Set up Cloudflare Pages for docs site (or use GitHub Pages from `/docs`)

### GitHub Repo Polish
- [ ] Set repo description: "AEO SDK — give your website an API for AI agents. Auto-infers JSON-RPC tools from semantic HTML. WebMCP-compatible."
- [ ] Add topics: `webmcp`, `aeo`, `agentic-engine-optimization`, `ai-agents`, `typescript`, `json-rpc`, `mcp`, `browser`, `sdk`, `website`, `ecommerce`
- [ ] Add social preview image (1280×640 PNG)
- [ ] Add badges: npm version, bundle size, license, tests passing, TypeScript, WebMCP compatible
- [ ] Pin the demo link at the top of README

### Social Prep
- [ ] Register `aipjs.dev` domain (optional, $12/yr)
- [ ] Create Twitter/X account `@aipjs` or `@aipdotjs`
- [ ] Prepare the HN Show HN first-comment draft
- [ ] Prepare 5-tweet launch thread
- [ ] Prepare Reddit post drafts for r/webdev, r/javascript, r/programming
- [ ] Prepare Dev.to article (same as anchor blog post, cross-posted)
- [ ] Prepare Product Hunt listing draft (screenshots, description, maker comment)

---

## Launch Sequence

### Phase 1: Quiet Public (Day 1)

**Goal:** Publish to npm + GitHub. No promotion yet. Let it sit for 24 hours to catch any issues.

| Time | Action | Channel |
|------|--------|---------|
| Morning | Publish to npm: `npm publish --workspaces` | npm |
| Morning | Push to GitHub, make repo public | GitHub |
| Morning | Verify CDN: check jsDelivr URL resolves (`cdn.jsdelivr.net/npm/@aipjs/core`) | CDN |
| Afternoon | Verify demo works from CDN (test `https://cdn.jsdelivr.net/npm/@aipjs/core/dist/index.js`) | Test |
| EOD | Check for GitHub issues, npm install errors | Monitor |

### Phase 2: Developer Launch (Day 2–3)

**Goal:** Post to developer communities. This is the primary launch.

| Day | Time | Action | Channel |
|-----|------|--------|---------|
| Day 2 | 7:30 AM ET | Post Show HN with demo link | Hacker News |
| Day 2 | 9:00 AM ET | Post to r/webdev (Showoff Saturday if Saturday, otherwise technical write-up) | Reddit |
| Day 2 | 10:00 AM ET | Cross-post anchor blog post | Dev.to, Hashnode |
| Day 2 | Throughout | Reply to every HN comment within 30 minutes | HN |
| Day 2 | Evening | Post launch thread (5 tweets) | Twitter/X |
| Day 3 | Morning | Post to r/javascript and r/programming | Reddit |
| Day 3 | Afternoon | Post to LinkedIn | LinkedIn |

### Phase 3: Amplify (Day 4–7)

**Goal:** Ride momentum. Reach broader audiences.

| Day | Action | Channel |
|-----|--------|---------|
| Day 4 | Submit to JavaScript Weekly (link to GitHub + blog post) | Newsletter |
| Day 4 | Submit to Console.dev | Newsletter |
| Day 5 | Launch on Product Hunt (Tuesday–Thursday best) | Product Hunt |
| Day 5 | Post to r/opensource | Reddit |
| Day 5 | Post to r/SEO ("AEO is the next SEO — here's the first SDK for it") | Reddit |
| Day 6 | Pitch to SEO publications (Search Engine Journal, Search Engine Land) | Email |
| Day 6 | Submit to Frontend Focus and Node Weekly | Newsletter |
| Day 7 | Post demo video to YouTube | YouTube |

### Phase 4: Sustained Growth (Week 2–4+)

| Week | Action | Channel |
|------|--------|---------|
| Week 2 | Write technical deep-dive: "How aip.js auto-infers tool schemas from semantic HTML" | Dev.to, blog |
| Week 2 | Engage on Twitter: reply to AI agent / web dev discussions with aip.js angle | Twitter/X |
| Week 3 | Publish npm download milestone tweet ("1,000 downloads in 2 weeks") | Twitter/X |
| Week 3 | Submit to TLDR Web Dev and TLDR InfoSec | Newsletter |
| Week 4 | Guest post pitch to Smashing Magazine, CSS-Tricks, or freeCodeCamp | Email |
| Ongoing | Monitor GitHub issues, respond quickly | GitHub |
| Ongoing | Publish patch releases with fixes and improvements | npm |
| Ongoing | Build the plugin ecosystem (real estate, travel) based on community feedback | Code |

---

## Content Assets Checklist

### Must-Have (Before Day 1)
- [x] Demo micro-site ✅ (already built)
- [ ] 2-minute demo screen recording (GIF + MP4)
- [ ] Anchor blog post (1,500–2,500 words)
- [ ] GitHub README (polished with badges, quick-start, demo link)
- [ ] Social preview image (1280×640)

### Nice-to-Have (Week 1)
- [ ] Architecture diagram (SVG, already in README)
- [ ] "Why AEO?" explainer (500 words, non-technical)
- [ ] Comparison page: aip.js vs. Playwright vs. raw DOM scraping
- [ ] Quick-start video (60 seconds, just the `import { AIP }` line)

### Later
- [ ] Technical deep-dive blog posts (auto-inference algorithm, HITL security model)
- [ ] Case studies (real websites using aip.js)
- [ ] Plugin development guide
- [ ] WebMCP spec alignment explainer

---

## Target Outcomes (90-Day Goals)

| Metric | Baseline | 30-Day | 90-Day |
|--------|----------|--------|--------|
| GitHub stars | 0 | 200 | 1,000 |
| npm weekly downloads | 0 | 500 | 2,000 |
| Demo site visits | 0 | 2,000 | 10,000 |
| HN upvotes | 0 | 50 | — |
| Twitter followers | 0 | 100 | 500 |
| Known production users | 0 | 1 | 5+ |
| Community contributors | 0 | 0 | 3+ |

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| HN post flops (no upvotes) | Medium | Low | Have backup title/angle ready. Repost in 2 weeks with different framing. |
| WebMCP spec changes break compatibility | Low | High | aip.js is a polyfill layer — can adapt to spec changes. Monitor W3C CG. |
| Competitor emerges | Low | Medium | First-mover advantage. Build community fast. Open-source network effects. |
| npm publish failure | Low | Medium | Test publish workflow on a dummy package first. Use `npm publish --dry-run`. |
| "Agentic" terminology confuses people | Medium | Medium | Lead with "API for AI agents" not "AEO." Educate in content. |
| Low initial adoption | Medium | Low | It's free, open source. Long game. Content marketing builds over time. |
| Security concerns about agents accessing websites | Medium | High | This is aip.js's STRENGTH. Lead with HITL security in every pitch. "Agents CAN'T bypass human approval." |

---

## Decision Gate

After Phase 2 (Day 3), assess:

- **HN post >30 upvotes + positive comments?** → Proceed to Phase 3 with full energy.
- **HN post <10 upvotes?** → Skip paid promotion. Focus on content (blog posts, tutorials). Try HN again in 2 weeks with a different angle.
- **GitHub stars >50 after Week 1?** → Invest in newsletter sponsorship ($500–1,000).
- **<20 stars after Week 1?** → Stay organic. Build content. The market might not be ready yet — but you're first, so keep building.

---

*Next: Execute the pre-launch checklist.*
