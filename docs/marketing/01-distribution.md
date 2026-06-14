# 01 — Distribution Channels & Strategy

> **Project:** aip.js (Agentic Engine Optimization SDK)  
> **License:** Apache-2.0  
> **Date:** 2026-06-14  
> **Status:** Research complete — ready for execution

This document maps every distribution channel for aip.js, documents all costs, and provides step-by-step instructions for publishing. The goal: make aip.js trivially installable for any website owner.

---

## Table of Contents

1. [Package Naming & Namespace Strategy](#1-package-naming--namespace-strategy)
2. [NPM Publishing](#2-npm-publishing)
3. [CDN Distribution](#3-cdn-distribution)
4. [GitHub Repository Setup](#4-github-repository-setup)
5. [Documentation Hosting Comparison](#5-documentation-hosting-comparison)
6. [Package Distribution Strategy](#6-package-distribution-strategy)
7. [Cost Summary](#7-cost-summary)
8. [Action Items](#8-action-items)

---

## 1. Package Naming & Namespace Strategy

### Current State vs. Recommended State

The monorepo currently has a naming inconsistency that must be resolved **before** publishing:

| Package | Current `package.json` name | Recommended | Issue |
|---------|---------------------------|-------------|-------|
| types | `@aipjs/types` | `@aipjs/types` | ✅ OK |
| core | `@aipjs/core` | `@aipjs/core` | ✅ OK |
| security | `@aipjs/security` | `@aipjs/security` | ✅ OK |
| plugins/ecommerce | `@agentic-js/plugin-ecommerce` | `@aipjs/plugin-ecommerce` | ⚠️ Wrong namespace! |

**Fix needed:** Rename `@agentic-js/plugin-ecommerce` → `@aipjs/plugin-ecommerce` in:
- `packages/plugins/ecommerce/package.json`
- All internal dependency references
- README code examples

### Recommended Namespace

Use **`@aipjs`** as the single npm organization scope. Rationale:

- Short — 5 characters after `@`
- Matches the project name "aip.js"
- Published packages: `@aipjs/core`, `@aipjs/types`, `@aipjs/security`, `@aipjs/plugin-ecommerce`
- A future convenience meta-package could be `aipjs` (unscoped) that re-exports everything

**Note:** The npm organization `@aipjs` must be created before publishing scoped packages. See Section 2.

---

## 2. NPM Publishing

### 2.1 npm Organizations & Pricing

npm organizations manage scoped packages (`@scope/package-name`).

| Tier | Price | What You Get |
|------|-------|-------------|
| **Free** | $0/month | Unlimited public packages, unlimited developers, standard npm features |
| **Pro** | $7/user/month | Private packages, npm audit, org-level access control |
| **Team** | $9/user/month | Everything in Pro + team management, custom roles |
| **Enterprise** | Contact sales | SSO, dedicated support, compliance features |

> **aip.js needs:** Free tier only. All packages are public (Apache-2.0). No private packages needed.

**Key facts:**
- **Public packages are always free** — no limits on downloads, storage, or bandwidth
- Free orgs can have an unlimited number of members/collaborators
- You only pay if you need *private* packages
- The `@aipjs` org costs **$0**

### 2.2 Step-by-Step: Publishing to npm

#### Step 1: Create the npm Organization

```bash
# Create the @aipjs org on npmjs.com
# 1. Go to https://www.npmjs.com/org/create
# 2. Enter "aipjs" as the organization name
# 3. Select "Free" plan
# 4. Confirm

# Or via CLI:
npm org create @aipjs
```

#### Step 2: Login to npm

```bash
npm login
# Enter username, password, and 2FA code if enabled
npm whoami  # verify
```

#### Step 3: Configure `publishConfig` in Each Package

Each workspace package.json needs `publishConfig`:

```json
{
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

**Important:** `"access": "public"` is **required** for scoped packages on the free tier. Without it, npm defaults scoped packages to `"restricted"` (private), which requires a paid plan and will fail to publish.

Add to these files:
- `/workspace/agentic-js/packages/types/package.json`
- `/workspace/agentic-js/packages/core/package.json`
- `/workspace/agentic-js/packages/security/package.json`
- `/workspace/agentic-js/packages/plugins/ecommerce/package.json`

#### Step 4: Un-Private the Root `package.json`

The root `package.json` has `"private": true`. This is correct for a monorepo root — the root itself is **not** published as a package. Only the workspace packages are published. **Leave `"private": true`** on the root.

#### Step 5: Ensure Correct `files` or `.npmignore`

By default, npm publishes everything except `.git`, `node_modules`, etc. For TypeScript packages, you typically want only `dist/` and type declarations. Add to each workspace package.json:

```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

Or add an `.npmignore` to exclude source:
```
src/
tsconfig.json
node_modules/
.gitignore
*.tsbuildinfo
```

#### Step 6: Verify Package Readiness

```bash
# From each package directory, preview what will be published:
cd packages/types
npm pack --dry-run

# Check for common issues:
# - dist/ exists and contains .js + .d.ts files
# - package.json has valid name, version, main, types, exports
# - README.md exists
```

#### Step 7: Publish (In Dependency Order)

```bash
# Order matters: types first (no deps), then core+security (depend on types), then plugins

# 1. Types
cd packages/types
npm version 0.1.0  # ensure version is set
npm publish --access public

# 2. Core
cd ../core
npm version 0.1.0
npm publish --access public

# 3. Security
cd ../security
npm version 0.1.0
npm publish --access public

# 4. E-Commerce Plugin
cd ../plugins/ecommerce
npm version 0.1.0
npm publish --access public
```

#### Step 8: Verify on npm

```bash
npm view @aipjs/types
npm view @aipjs/core
npm view @aipjs/security
npm view @aipjs/plugin-ecommerce
```

Visit: https://www.npmjs.com/package/@aipjs/core etc.

### 2.3 npm Versioning Strategy

Recommended strategy for an SDK with pre-1.0 releases:

| Stage | Version Range | npm Tag |
|-------|--------------|---------|
| Early development / alpha | `0.1.x` — `0.9.x` | `latest` |
| Beta / release candidate | `0.10.x`+ or `1.0.0-rc.x` | `next` |
| Stable v1 | `1.0.0` | `latest` |

Use `npm version` to bump:
```bash
npm version patch   # 0.1.0 → 0.1.1 (bug fixes)
npm version minor   # 0.1.0 → 0.2.0 (new features, backward compatible)
npm version major   # 0.1.0 → 1.0.0 (breaking changes)
```

**Pre-1.0 conventions:** In the 0.x range, SemVer treats minor bumps as potentially breaking. Be explicit in release notes.

**Workspace versioning tooling:** Consider one of:
- **Changesets** (`@changesets/cli`) — most popular in monorepo OSS projects. Free.
- **Lerna-Lite** — lightweight monorepo versioning. Free.
- **Manual** — simple for 4 packages, but error-prone over time.

**Recommendation:** Changesets for automated changelogs and coordinated versioning.

### 2.4 npm Cost Summary

| Item | Cost |
|------|------|
| npm organization (`@aipjs`) | **$0** (free tier) |
| Public package hosting (unlimited) | **$0** |
| Bandwidth / downloads | **$0** (no limits) |
| Private packages (not needed) | N/A |
| **Total npm cost** | **$0/year** |

---

## 3. CDN Distribution

CDNs are critical for aip.js because the primary install method for website owners is a `<script>` tag — no build step, no npm install.

### 3.1 jsDelivr

**URL:** https://www.jsdelivr.com  
**How it works:** jsDelivr auto-indexes **every** npm package within minutes of publishing. Zero configuration needed.

**URL pattern:**
```
https://cdn.jsdelivr.net/npm/@aipjs/core/dist/index.js
https://cdn.jsdelivr.net/npm/@aipjs/core@0.1.0/dist/index.js   # pinned version
https://cdn.jsdelivr.net/npm/@aipjs/core@0.1/dist/index.js      # pinned minor
```

**Features:**
- Multi-CDN: Cloudflare, Fastly, BunnyCDN, Quantil, and more
- HTTP/3 support
- Immutable caching (version-pinned URLs cached for 1 year)
- ES modules supported natively (browsers resolve `import` statements)
- Auto-minifies `.js` files (add `.min.js` suffix — or it does it automatically)
- Combine multiple files: `.../combine/file1.js,file2.js`
- GitHub integration (also serves from GitHub repos)

**Cost:** **Completely free.** No bandwidth limits. Funded by sponsors (DragonBlood, NS1, etc.). No account needed.

**For the self-contained demo bundle:**
```
https://cdn.jsdelivr.net/npm/@aipjs/core@0.1.0/dist/index.js
```
Or if we publish a bundle package:
```
https://cdn.jsdelivr.net/npm/aipjs@0.1.0/dist/aip.js
```

### 3.2 unpkg

**URL:** https://unpkg.com  
**How it works:** Auto-indexes npm packages. Every file in the published npm tarball is available.

**URL pattern:**
```
https://unpkg.com/@aipjs/core/dist/index.js
https://unpkg.com/@aipjs/core@0.1.0/dist/index.js
https://unpkg.com/@aipjs/core@^0.1.0/dist/index.js   # semver range
```

**Features:**
- Single CDN backend (Cloudflare)
- `?module` query param rewrites bare imports for ES modules
- `?meta` shows directory listing
- Semver-range URLs (`@^0.1.0`) redirect to latest matching version
- Caches for 1 year on version-pinned URLs

**Cost:** **Completely free.** Created by Michael Jackson (React Router). No bandwidth limits, no account needed.

**Considerations:**
- Single-CDN (Cloudflare only) — less redundancy than jsDelivr's multi-CDN
- Less actively maintained than jsDelivr in recent years, but still reliable
- Good for development / quick prototyping

### 3.3 esm.sh

**URL:** https://esm.sh  
**How it works:** Builds npm packages into ES modules on-the-fly. Handles CJS→ESM conversion, bundles dependencies, tree-shakes.

**URL pattern:**
```
https://esm.sh/@aipjs/core
https://esm.sh/@aipjs/core@0.1.0
https://esm.sh/@aipjs/security
https://esm.sh/@aipjs/plugin-ecommerce
```

**Query params for optimization:**
```
?bundle           # Bundle all dependencies into a single file
?target=es2022    # Target ES version
?minify           # Minify output
?no-dts           # Strip TypeScript declarations
?exports=...      # Choose specific export
```

**Example — optimized bundle URL:**
```
https://esm.sh/@aipjs/core@0.1.0?bundle&target=es2022&minify
```

**Features:**
- Automatic ESM wrapping for CJS packages
- Import maps support
- Deno compatibility
- CSS imports supported
- JSX/TSX transformation
- Worker support
- Builds on edge (Cloudflare Workers)

**Cost:** **Free** for public packages. Fair use policy applies. No hard bandwidth limits published. For high-traffic sites (100M+ requests/month), consider self-hosting or using jsDelivr as primary with esm.sh as fallback.

### 3.4 Skypack (Deprecated — DO NOT USE)

**URL:** https://www.skypack.dev  
**Status:** **Shut down.** Skypack was sunset in 2023/2024. The service is no longer operational.

### 3.5 Other CDN Options

| CDN | URL Pattern | Cost | Notes |
|-----|------------|------|-------|
| **bundle.run** | `https://bundle.run/@aipjs/core` | Free | Browser-focused bundler via unpkg |
| **pika CDN** | `https://cdn.pika.dev/@aipjs/core` | Free | Part of Skypack; shut down |
| **Snowpack CDN** | Deprecated | N/A | Superseded by Skypack |
| **JSPM** | `https://jspm.dev/@aipjs/core` | Free | Generates import maps; good for SystemJS |
| **deno.land/x** | `https://deno.land/x/aipjs` | Free | Deno-specific; can wrap npm packages |

### 3.6 CDN Cost Summary

| CDN | Cost | Bandwidth Limits | Multi-CDN | ESM Native | Auto-Minify |
|-----|------|-----------------|-----------|------------|-------------|
| **jsDelivr** | $0 | None | ✅ (5+ CDNs) | ✅ | ✅ |
| **unpkg** | $0 | None | ❌ (Cloudflare) | ✅ (`?module`) | ❌ |
| **esm.sh** | $0 | Fair use | ❌ (Cloudflare Workers) | ✅ | ✅ (`?minify`) |
| **JSPM** | $0 | Fair use | ❌ | ✅ | ✅ |
| **Skypack** | N/A | N/A | N/A | **SHUT DOWN** | — |

### 3.7 CDN Recommendation

**Primary:** jsDelivr (multi-CDN, zero config, best reliability)  
**Secondary:** esm.sh (for users who want bundled+optimized ESM)  
**Tertiary:** unpkg (good for link rot resilience — another mirror)

All three are free. No reason not to be available on all of them — they all auto-index from npm.

---

## 4. GitHub Repository Setup

### 4.1 Repository Location

Planned: `https://github.com/aipjs/aip.js` (or `https://github.com/aipjs/agentic-js`)

**Cost:** Free for public repositories. Unlimited collaborators.

### 4.2 Repository Settings

#### About / Description

Go to repo → gear icon (Settings) → General → Description:
```
Agentic Engine Optimization (AEO) SDK — give websites structured capabilities 
that browser AI agents can discover and use via JSON-RPC tool schemas
```

#### Topics / Tags

Add these topics in the repository settings (improves GitHub discoverability):
```
ai-agents, agentic, webmcp, json-rpc, sdk, typescript, aeo, agentic-engine-optimization,
browser, tools, schema, inference, hitl, security, ecommerce, npm-package
```

#### Social Preview Image

GitHub uses Open Graph meta tags for link previews. To set a social preview:

1. Create a 1280×640 PNG image (the OG standard)
2. Place at `/docs/assets/social-preview.png` in the repo
3. Add to README or website HTML:

```html
<meta property="og:image" content="https://aipjs.dev/assets/social-preview.png" />
<meta property="og:image:width" content="1280" />
<meta property="og:image:height" content="640" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://aipjs.dev/assets/social-preview.png" />
```

GitHub automatically picks up the first `<meta property="og:image">` it finds when generating link previews. If your repo has GitHub Pages with these tags, they'll be used.

For the **repo's own GitHub preview** (when linked in issues/PRs), GitHub uses the repository owner's avatar unless social preview is configured in Pages.

### 4.3 Shields / Badges

Add to the top of README.md:

```markdown
[![npm version](https://img.shields.io/npm/v/@aipjs/core?color=6366f1&label=%40aipjs%2Fcore)](https://www.npmjs.com/package/@aipjs/core)
[![npm bundle size](https://img.shields.io/bundlejs/size/@aipjs/core?color=10b981)](https://bundlejs.com/?q=%40aipjs%2Fcore)
[![License](https://img.shields.io/npm/l/@aipjs/core?color=blue)](https://github.com/aipjs/aip.js/blob/main/LICENSE)
[![Tests](https://img.shields.io/badge/tests-19%2F19-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![WebMCP](https://img.shields.io/badge/WebMCP-compatible-6366f1)](https://webmachinelearning.github.io/webmcp)
```

Additional badges to consider:
- CDN availability: `![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@aipjs/core?color=orange)`
- Bundle size via BundleJS: `[![bundle size](https://img.shields.io/bundlejs/size/@aipjs/core)](...)`
- Code coverage (if set up with Codecov/Coveralls)
- GitHub stars: `![GitHub Stars](https://img.shields.io/github/stars/aipjs/aip.js)`

### 4.4 GitHub Pages for Documentation

GitHub Pages can host static documentation from:

**Option A: `/docs` folder on main branch**
- Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, Folder: `/docs`
- Put docs site in `/docs` directory
- URL: `https://aipjs.github.io/aip.js/`
- Free, no build step needed if docs are pure HTML

**Option B: `gh-pages` branch (separate)**
- Build docs to a `gh-pages` branch via CI
- Keeps source and output separate
- Same URL: `https://aipjs.github.io/aip.js/`

**Option C: Custom domain**
- Settings → Pages → Custom domain: `docs.aipjs.dev` (or `aipjs.dev`)
- Requires a CNAME record pointing to `aipjs.github.io`
- Free SSL via Let's Encrypt (automatic)

**Cost:** **$0** — included with GitHub. 100GB bandwidth/month, 10 builds/hour, max 1GB site size.

### 4.5 GitHub Cost Summary

| Item | Cost |
|------|------|
| Public repository | **$0** |
| GitHub Pages | **$0** |
| GitHub Actions (2000 min/month free) | **$0** for public repos |
| **Total GitHub cost** | **$0/year** |

---

## 5. Documentation Hosting Comparison

Aip.js needs a simple documentation site — API reference, getting started guides, and the demo. All options below support static HTML.

### 5.1 GitHub Pages

| Feature | Detail |
|---------|--------|
| **URL** | `https://aipjs.github.io/aip.js/` or custom domain |
| **Cost** | **$0** |
| **Bandwidth** | 100 GB/month |
| **Build minutes** | 10 builds/hour (GitHub Actions for static gen) |
| **Custom domain** | ✅ Free |
| **SSL** | ✅ Let's Encrypt (auto) |
| **Site size limit** | 1 GB |
| **Deploy method** | Push to branch or GitHub Actions |
| **CDN** | Fastly |
| **Limitations** | No server-side rendering, no serverless functions, no redirects (except Jekyll-style) |

### 5.2 Vercel

| Feature | Detail |
|---------|--------|
| **URL** | `https://aipjs.vercel.app` or custom domain |
| **Cost (Hobby)** | **$0** |
| **Bandwidth** | 100 GB/month |
| **Build minutes** | 6,000 minutes/month |
| **Serverless functions** | 100 GB-hours/month, 10s max execution |
| **Custom domain** | ✅ Free |
| **SSL** | ✅ Auto |
| **Preview deployments** | ✅ Per-branch |
| **Analytics** | Available (paid) |
| **Limits** | 1 concurrent build, 100 deployments/day, no commercial use on Hobby |

**Note:** Vercel's Hobby plan says "no commercial use." Since aip.js is an OSS project with a free SDK, this is a gray area. Vercel generally doesn't enforce this against OSS documentation sites, but if the site monetizes or promotes a paid SaaS service, it might matter. If concerned, use the **Pro plan at $20/month**.

### 5.3 Netlify

| Feature | Detail |
|---------|--------|
| **URL** | `https://aipjs.netlify.app` or custom domain |
| **Cost (Starter)** | **$0** |
| **Bandwidth** | 100 GB/month |
| **Build minutes** | 300 minutes/month |
| **Serverless functions** | 125K requests/month |
| **Forms** | ✅ 100 submissions/month |
| **Custom domain** | ✅ Free |
| **SSL** | ✅ Let's Encrypt (auto) |
| **Preview deployments** | ✅ Deploy previews |
| **Split testing** | Available on Pro plan |
| **Limitations** | 1 concurrent build, 1 member (add contributors freely for OSS) |

### 5.4 Cloudflare Pages

| Feature | Detail |
|---------|--------|
| **URL** | `https://aipjs.pages.dev` or custom domain |
| **Cost** | **$0** |
| **Bandwidth** | **Unlimited** (no published limits) |
| **Build minutes** | 500 builds/month |
| **Custom domain** | ✅ Free |
| **SSL** | ✅ Auto |
| **Preview deployments** | ✅ |
| **Cloudflare Workers** | 100K requests/day (free) |
| **Limitations** | 1 concurrent build, 20K files per site, 25MB per file |

### 5.5 Comparison Matrix

| Feature | GitHub Pages | Vercel | Netlify | Cloudflare Pages |
|---------|-------------|--------|---------|-----------------|
| **Cost** | $0 | $0 (Hobby) | $0 (Starter) | $0 |
| **Bandwidth** | 100 GB | 100 GB | 100 GB | Unlimited |
| **Custom domain** | ✅ | ✅ | ✅ | ✅ |
| **Auto SSL** | ✅ | ✅ | ✅ | ✅ |
| **Per-branch previews** | ❌ | ✅ | ✅ | ✅ |
| **Serverless functions** | ❌ | ✅ | ✅ | ✅ (Workers) |
| **Build minutes** | Via Actions | 6,000/mo | 300/mo | 500/mo |
| **Concurrent builds** | Via Actions | 1 | 1 | 1 |
| **CDN** | Fastly | Vercel Edge | Netlify Edge | Cloudflare Global |
| **Analytics** | ❌ | Paid | Paid | Free basic |
| **Commercial use OK** | ✅ | Gray area | ✅ | ✅ |

### 5.6 Documentation Hosting Recommendation

**Primary: Cloudflare Pages** — best value ($0, unlimited bandwidth, global CDN, no commercial-use gray area).

**Alternative: GitHub Pages** — simplest if docs are pure static HTML/Markdown. No build step if using tools like VitePress or Docusaurus that output static files (build in GitHub Actions, deploy to Pages).

**What about both?** Point a custom domain at Cloudflare Pages with GitHub Pages as a fallback. Since Cloudflare gives unlimited bandwidth, there's not much need for a fallback.

**Recommendation for aip.js:**
- Use **Cloudflare Pages** for the primary docs site at `docs.aipjs.dev` or `aipjs.dev`
- Build with **VitePress** (Vue-based, optimized for docs) or **Starlight** (Astro-based)
- Build and deploy automatically on push to `main`
- Host the demo on the same domain: `aipjs.dev/demo/`

---

## 6. Package Distribution Strategy

### 6.1 Individual Packages vs. Single Bundle

#### Option A: Individual Scoped Packages (Current Approach)

```
@aipjs/types          —  ~2 KB (zero deps, pure type definitions)
@aipjs/core           —  ~8 KB (depends on @aipjs/types)
@aipjs/security       —  ~6 KB (depends on @aipjs/types)
@aipjs/plugin-ecommerce — ~5 KB (depends on @aipjs/types + @aipjs/core)
```

**Pros:**
- ✅ Tree-shakeable — users install only what they need
- ✅ Clear dependency boundaries
- ✅ Independent versioning (security patch doesn't force core upgrade)
- ✅ Standard monorepo pattern (React, Babel, VueUse)
- ✅ Each package has its own README, tests, changelog
- ✅ Internal types package is shared cleanly

**Cons:**
- ❌ More npm install commands for users (`npm i @aipjs/core @aipjs/security @aipjs/plugin-ecommerce`)
- ❌ More CDN script tags if not using the bundle
- ❌ Higher mental overhead for new users ("which packages do I need?")
- ❌ Version mismatch risk if packages diverge

#### Option B: Single Meta-Package (aipjs)

```
aipjs (unscoped) — re-exports everything: core + security + plugins
```

In addition to (not replacing) the individual packages.

```json
// aipjs/package.json
{
  "name": "aipjs",
  "dependencies": {
    "@aipjs/core": "^1.0.0",
    "@aipjs/security": "^1.0.0",
    "@aipjs/plugin-ecommerce": "^1.0.0"
  }
}
```

```js
// aipjs/src/index.ts
export * from '@aipjs/core';
export * from '@aipjs/security';
export * from '@aipjs/plugin-ecommerce';
```

**Pros:**
- ✅ One install: `npm install aipjs`
- ✅ One CDN URL for everything
- ✅ Great for demos and quick starts
- ✅ Doesn't prevent granular imports (users can still use `@aipjs/core` directly)

**Cons:**
- ❌ Bundles code users might not need
- ❌ Extra maintenance (keeping re-exports in sync)
- ❌ Unscoped name `aipjs` might be taken on npm

### 6.2 The Demo Bundle (35 KB Self-Contained ESM)

The project already has a demo bundle configured in `tsup.config.ts`:

```ts
// tsup.config.ts — builds demo/vendor/bundle-entry.mjs
// Self-contained ESM bundle: all internal packages + no external deps
// 35 KB gzipped estimate
```

**How this fits:**
1. **CDN demo URL:** `https://cdn.jsdelivr.net/npm/aipjs-demo/dist/aip-bundle.js`
2. **On the docs site:** `<script type="module" src="/demo/vendor/aip-bundle.js"></script>`
3. **As a quick-start:** Users can try aip.js in a single script tag before committing to npm install

**Recommendation:** Publish the bundle as a separate npm package (e.g., `aipjs-bundle` or include it as an artifact on GitHub Releases) so the CDN URLs auto-resolve.

### 6.3 Recommended Strategy

**Hybrid approach — do all three:**

1. **Individual packages** (`@aipjs/core`, `@aipjs/security`, `@aipjs/types`, `@aipjs/plugin-ecommerce`)
   - For production users who want tree-shaking and fine-grained control
   - Each independently versioned
   - Published to npm with `access: public`

2. **Convenience meta-package** (`aipjs`)
   - For "just give me everything" users
   - Re-exports from all `@aipjs/*` packages
   - Single `npm install aipjs` or single CDN URL
   - **Important:** Check if `aipjs` is available on npm first

3. **Demo / self-contained bundle**
   - For the docs site demo micro-site
   - For quick `<script>` tag evaluation
   - Available via jsDelivr: `https://cdn.jsdelivr.net/npm/aipjs-bundle@0.1.0/dist/aip.js`
   - 35 KB gzipped, zero dependencies

### 6.4 CDN Usage Examples

```html
<!-- Option 1: Self-contained bundle (simplest) -->
<script type="module">
  import { AgenticJS, createHITLManager } from 'https://cdn.jsdelivr.net/npm/aipjs@0.1.0/dist/aip.js';
  // everything in one file
</script>

<!-- Option 2: Granular imports (tree-shaken) -->
<script type="module">
  import { AgenticJS } from 'https://cdn.jsdelivr.net/npm/@aipjs/core@0.1.0/dist/index.js';
  import { createHITLManager } from 'https://cdn.jsdelivr.net/npm/@aipjs/security@0.1.0/dist/index.js';
</script>

<!-- Option 3: esm.sh (auto-bundled + optimized) -->
<script type="module">
  import { AgenticJS } from 'https://esm.sh/@aipjs/core@0.1.0?bundle&target=es2022&minify';
</script>

<!-- Option 4: Import map (cleanest for production) -->
<script type="importmap">
{
  "imports": {
    "@aipjs/core": "https://cdn.jsdelivr.net/npm/@aipjs/core@0.1.0/dist/index.js",
    "@aipjs/security": "https://cdn.jsdelivr.net/npm/@aipjs/security@0.1.0/dist/index.js",
    "@aipjs/plugin-ecommerce": "https://cdn.jsdelivr.net/npm/@aipjs/plugin-ecommerce@0.1.0/dist/index.js"
  }
}
</script>
<script type="module">
  import { AgenticJS } from '@aipjs/core';
  import { createHITLManager } from '@aipjs/security';
</script>
```

---

## 7. Cost Summary

### Total Annual Cost: **$0**

| Channel | Item | Cost |
|---------|------|------|
| **npm** | @aipjs organization (free tier) | $0 |
| **npm** | Unlimited public packages | $0 |
| **npm** | Unlimited downloads/bandwidth | $0 |
| **jsDelivr** | CDN distribution | $0 |
| **unpkg** | CDN distribution | $0 |
| **esm.sh** | CDN distribution | $0 |
| **GitHub** | Public repository | $0 |
| **GitHub** | GitHub Actions (2,000 min/mo) | $0 |
| **GitHub Pages** | Static docs hosting (or fallback) | $0 |
| **Cloudflare Pages** | Primary docs hosting | $0 |
| **Domain** | `aipjs.dev` (~$12-15/year, optional) | ~$12/yr |
| **TOTAL** | | **$0/year** (or $12 with custom domain) |

### If You Want Paid Upgrades (Not Needed Now)

| Service | Plan | Cost | When You'd Need It |
|---------|------|------|--------------------|
| npm | Pro | $7/user/mo | Private packages, org access control |
| Vercel | Pro | $20/mo | If docs site is commercial, 6K+ build min |
| Netlify | Pro | $19/mo | More bandwidth, team management |
| Domain | Namecheap/Cloudflare | ~$12/yr | `aipjs.dev` for nicer URL |

---

## 8. Action Items

### Immediate (Before Publishing)

- [ ] **Fix package name:** Rename `@agentic-js/plugin-ecommerce` → `@aipjs/plugin-ecommerce` in `packages/plugins/ecommerce/package.json` and all references
- [ ] **Create npm org:** `@aipjs` on npmjs.com (free tier)
- [ ] **Add `publishConfig`** with `"access": "public"` to all 4 workspace package.json files
- [ ] **Add `"files"` field** to each workspace package.json (include `dist`, `README.md`, `LICENSE`)
- [ ] **Create GitHub repo:** `github.com/aipjs/aip.js`
- [ ] **Set up repo:** description, topics, social preview image, badges in README
- [ ] **Check npm name availability:** Is `aipjs` (unscoped) available?

### Before v0.1.0 Release

- [ ] **Set up Changesets** for automated versioning and changelogs
- [ ] **Configure GitHub Actions** for CI (build, test, lint) on PR and push
- [ ] **Add npm publish workflow** to GitHub Actions (publish on tag/release)
- [ ] **Create the convenience meta-package** (`aipjs` unscoped, re-exports everything)
- [ ] **Create the bundle package** (`aipjs-bundle` or similar, self-contained ESM)
- [ ] **Set up Cloudflare Pages** for `docs.aipjs.dev`
- [ ] **Build docs site** (VitePress or Starlight)
- [ ] **Register domain** `aipjs.dev` (~$12/year via Cloudflare Registrar)

### Post-Launch

- [ ] **Add BundleJS badge** once published (shows real gzipped size)
- [ ] **Add jsDelivr hits badge** for social proof
- [ ] **Submit to CDN directories** (jsDelivr Featured, etc.)
- [ ] **Cross-post to relevant communities** (Hacker News, Reddit r/javascript, Dev.to)

---

## Appendix: Useful Links

| Resource | URL |
|----------|-----|
| npm Organization Creation | https://www.npmjs.com/org/create |
| npm Publish Docs | https://docs.npmjs.com/cli/v11/commands/npm-publish |
| jsDelivr Docs | https://www.jsdelivr.com/documentation |
| esm.sh Docs | https://esm.sh/#docs |
| unpkg Docs | https://unpkg.com/ |
| GitHub Pages Docs | https://docs.github.com/en/pages |
| Cloudflare Pages Docs | https://developers.cloudflare.com/pages/ |
| VitePress | https://vitepress.dev |
| Starlight (Astro) | https://starlight.astro.build |
| Changesets | https://github.com/changesets/changesets |
| BundleJS | https://bundlejs.com |
| Shields.io (badges) | https://shields.io |
