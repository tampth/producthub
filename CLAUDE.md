# CLAUDE.md — ProductHUB Project Guide

This file tells Claude how to work in this repository. Read it fully before starting any task.

---

## 1. Project Overview

**ProductHUB** is an internal Next.js 14 web app for the Long Châu eCommerce Product Operations team.
It serves as an asynchronous, on-demand resource base — reducing ad-hoc comms and context switching.

**Core principle:** Reuse information, don't recreate it.

### Tech Stack
- **Framework:** Next.js 14 App Router + TypeScript + Tailwind CSS
- **Database:** Obsidian Markdown vault (`.md` files, not a real DB)
- **Parsing:** `gray-matter` (YAML frontmatter + markdown body)
- **Server:** Next.js API routes at `app/api/obsidian/[entity]/route.ts`
- **Client hook:** `useObsidian<T>(entity)` in `lib/hooks/useObsidian.ts`

### Key Paths
```
C:\Users\User\Documents\ProductHUB\          ← Next.js app root
C:\Users\User\Documents\tampt48\ProductHUB\  ← Obsidian vault (the database)
  ├── Ideas/        (IDEA-{prefix}-{n}.md)
  ├── Bugs/         (INC-{n}.md)
  ├── Requirements/ (REQ-{prefix}-{n}.md)
  ├── Decisions/    (ADR-{prefix}-{n}.md)
  ├── News/         (news-{slug}.md)
  ├── Team/         (member-{n}.md)
  ├── Glossary/     ({term-slug}.md)
  ├── Demos/
  └── Feedback/
```

### Environment
```
OBSIDIAN_VAULT_PATH=C:\Users\User\Documents\tampt48
OBSIDIAN_PRODUCTHUB_FOLDER=ProductHUB
```

### BODY_FIELD mapping (which markdown field becomes the body)
```typescript
ideas        → 'description'
bugs         → 'description'
requirements → 'description'
news         → 'content'
feedback     → 'content'
team         → ''  (no body — all in frontmatter)
glossary     → 'definition'
decisions    → ''
backlog      → 'description'
demos        → ''
```

---

## 2. Task Type: ProductHUB Development

When the user asks for UI changes, new features, or fixes:

### Before writing any code
1. Read the relevant page file in `app/`
2. Read `lib/types.ts` for data shapes
3. Check if the entity has an Obsidian API route in `app/api/obsidian/[entity]/`

### Conventions — follow exactly
- **No comments** unless the WHY is non-obvious
- **No premature abstractions** — don't build helpers for hypothetical future use
- **No error handling for impossible scenarios** — trust TypeScript and Next.js guarantees
- **No localStorage** for stats — always read from Obsidian via `useObsidian`
- **Tailwind only** — no inline `style={}` unless truly necessary
- **Icons:** Lucide React only (already installed)
- **Dates:** use `formatDate()` and `formatRelative()` from `lib/utils.ts` — they handle null/undefined safely

### Common patterns

**Reading Obsidian data (client-side):**
```typescript
const { items, loading, error } = useObsidian<MyType>('entity-name')
```

**Writing to Obsidian (API call):**
```typescript
await fetch('/api/obsidian/ideas', {
  method: 'POST',
  body: JSON.stringify({ id, title, status, ... })
})
```

**Adding a new entity:** Add to `BODY_FIELD` in `lib/obsidian.ts`, add to the `entities` array, add the TypeScript interface in `lib/types.ts`.

### Testing
- Run `npm run dev` and open the browser to verify UI changes
- Run `npx next build` to catch TypeScript errors before claiming done
- Delete `.next` folder and restart if webpack chunk errors appear

---

## 3. Task Type: Submit Item

When the user inputs information (text, screenshot, document, idea) and wants to submit it as a ProductHUB item.

### Flow — always follow in order

**Step 1 — Gather input**
User provides raw input: a problem description, a BRD excerpt, a complaint, a meeting note, etc.

**Step 2 — Clarify intent (ask before writing)**
Ask the user:
- **Which product/domain?** (e.g., OMNI/Call Center, eCommerce Web, App, Logistics…)
- **What type of items should be created?** Propose decomposition — don't just ask, suggest:
  - A bug if something is broken
  - An idea + request if it's a feature ask
  - A requirement if it's a spec
  - A decision if a trade-off was made
  - A news item if it's an announcement
- **Priority and urgency** if not obvious
- **Confirm decomposition** — show the full list of items you plan to create and wait for approval

**Step 3 — Write to vault**
After user confirms, write each item as a `.md` file to the correct folder.

### Product → ID Prefix mapping
| Product / Domain              | Prefix | Example IDs              |
|-------------------------------|--------|--------------------------|
| OMNI / Call Center            | CC     | IDEA-CC-01, REQ-CC-01    |
| eCommerce Web                 | WEB    | IDEA-WEB-01, REQ-WEB-01  |
| Mobile App                    | APP    | IDEA-APP-01, REQ-APP-01  |
| Logistics / Fulfillment       | LOG    | IDEA-LOG-01, REQ-LOG-01  |
| Internal Tools / Back Office  | BO     | IDEA-BO-01, REQ-BO-01    |
| Cross-product / General       | GEN    | IDEA-GEN-01, REQ-GEN-01  |

For Bugs/Incidents the format is `INC-{n}` (no prefix — all products share one incident log).
For Decisions the format is `ADR-{prefix}-{n}`.

**Auto-increment:** Before writing, glob the target folder to find the highest existing number and increment by 1.

### Frontmatter templates

**Idea / Request** (`Ideas/IDEA-{prefix}-{n}.md`):
```yaml
---
id: IDEA-CC-01
title: <concise title>
type: idea          # or: request
status: submitted
priority: medium    # low | medium | high | critical
votes: 0
submitter: <user's name or team>
team: <product team>
author: <user's name or team>
date: <today YYYY-MM-DD>
tags:
  - <tag>
---

## Vấn đề / Problem
<what problem does this solve>

## Đề xuất / Proposal
<what is being proposed>

## Giá trị kỳ vọng / Expected Value
<what outcome is expected>
```

**Bug / Incident** (`Bugs/INC-{n}.md`):
```yaml
---
id: INC-001
title: <concise title>
status: open        # open | in-progress | resolved | closed | wont-fix
severity: high      # low | medium | high | critical
product: <product name>
reporter: <reporter name>
date: <today YYYY-MM-DD>
tags:
  - <tag>
---

## Mô tả / Description
<what is broken, observed behavior vs expected>

## Steps to Reproduce
1. ...

## Impact
<who/what is affected>
```

**Requirement** (`Requirements/REQ-{prefix}-{n}.md`):
```yaml
---
id: REQ-CC-01
title: <concise title>
status: draft       # draft | in-review | approved | deprecated
priority: medium
product: <product name>
author: <author>
date: <today YYYY-MM-DD>
tags:
  - <tag>
---

## Bối cảnh / Context
<business context>

## Yêu cầu / Requirements
<functional requirements>

## Acceptance Criteria
- [ ] ...
```

**Decision** (`Decisions/ADR-{prefix}-{n}.md`):
```yaml
---
id: ADR-CC-001
title: <decision title>
status: accepted    # proposed | accepted | deprecated | superseded
date: <today YYYY-MM-DD>
author: <author>
tags:
  - <tag>
---

## Context
<why this decision was needed>

## Decision
<what was decided>

## Consequences
<trade-offs, risks, implications>
```

**News** (`News/news-{slug}.md`):
```yaml
---
id: news-<slug>
title: <title>
category: updates   # updates | snapshot | roadmaps | metrics | vision | blog
date: <today YYYY-MM-DD>
author: <author>
tags:
  - <tag>
---

<markdown body content>
```

### Language
- Write item titles and tags in English (for IDs and filtering)
- Write body content in Vietnamese if the user inputs in Vietnamese
- Mirror the user's language for content body — don't auto-translate

---

## 4. Task Type: System Integration

When the user asks to integrate external tools (Jira, Google Drive, Outlook, Slack, etc.).

### Approach
1. **Understand the sync direction:** Is it one-way (pull from Jira into ProductHUB) or two-way?
2. **Identify the entity:** Which ProductHUB entity maps to the external data? (Jira issues → Bugs or Backlog, Drive docs → Requirements or News, etc.)
3. **Propose the integration pattern** before writing code:
   - **Pull (scheduled/on-demand):** An API route that fetches from the external tool and writes `.md` files to the vault
   - **Push (webhook):** External tool calls a ProductHUB webhook endpoint
   - **Embed (read-only display):** Iframe or API fetch embedded in a page

### Integration patterns

**New API integration route structure:**
```
app/api/integrations/{tool}/route.ts     ← the sync handler
lib/integrations/{tool}.ts               ← client/adapter logic
```

**Environment variables pattern:**
Add to `.env.local`:
```
JIRA_BASE_URL=https://your-org.atlassian.net
JIRA_EMAIL=...
JIRA_API_TOKEN=...
GOOGLE_SERVICE_ACCOUNT_JSON=...
OUTLOOK_CLIENT_ID=...
OUTLOOK_CLIENT_SECRET=...
OUTLOOK_TENANT_ID=...
```

**When building integrations:**
- Always make the sync idempotent — running it twice should not create duplicates. Use the external item's ID as the ProductHUB `.md` filename.
- Add a `source` and `sourceId` field to the frontmatter so items can be traced back to their origin
- Show sync status in the Settings page (`app/settings/page.tsx`)

### Known planned integrations
| Tool          | Maps to           | Direction     | Priority |
|---------------|-------------------|---------------|----------|
| Jira          | Backlog, Bugs      | Jira → vault  | High     |
| Google Drive  | Requirements, News | Drive → vault | Medium   |
| Outlook       | Demos, News       | Outlook → vault | Medium |
| Slack (webhooks) | Feedback       | Slack → vault | Low     |

---

## 5. Vault & File Conventions

- **File encoding:** UTF-8, LF line endings
- **Frontmatter:** YAML between `---` markers, always first thing in the file
- **Date format in frontmatter:** `YYYY-MM-DD`
- **ID uniqueness:** IDs must be unique within each entity folder — always check before writing
- **Tags:** lowercase, hyphenated (e.g., `call-center`, `in-progress`)
- **Status values must match TypeScript types** — always check `lib/types.ts` before writing a status field
- **Arrays in YAML:** Use indented list format:
  ```yaml
  tags:
    - foo
    - bar
  ```

---

## 6. Quick Reference

| Need to... | Go to... |
|---|---|
| Add a new page | `app/{page}/page.tsx` |
| Change nav | `components/layout/Sidebar.tsx` |
| Change header | `components/layout/Header.tsx` |
| Add a new entity | `lib/types.ts` + `lib/obsidian.ts` (BODY_FIELD) |
| Read vault data in a component | `useObsidian<T>('entity')` |
| Format a date safely | `formatDate(str)` from `lib/utils.ts` |
| Write a new vault item | `POST /api/obsidian/{entity}` |
| Check valid status values | `lib/types.ts` (all Status types are at the top) |
| Find vault files | `C:\Users\User\Documents\tampt48\ProductHUB\` |
