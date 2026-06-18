# Article Review Workspace

A collaborative platform for managing and reviewing academic articles. Teams can organize literature searches into projects, import articles in bulk from PubMed exports, and track each article through a review workflow.

## Prerequisites

- Node.js v20+
- npm v10+
- PostgreSQL v14+ running locally

## Local Setup

**1. Clone and install**

```bash
git clone <repo-url>
cd article-review-workspace
npm install
```

**2. Configure environment variables**

```bash
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/article-review-workspace"
AUTH_SECRET="your-secret-here"   # generate with: npx auth secret
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

**3. Set up the database**

```bash
createdb article-review-workspace
npm run db:migrate
```

**4. Start the dev server**

```bash
npm run dev
```

The app runs at [http://localhost:3003](http://localhost:3003).

## OAuth Setup

**Discord:** Create an application at [discord.com/developers/applications](https://discord.com/developers/applications), add redirect URI `http://localhost:3003/api/auth/callback/discord`, copy the client ID and secret into `.env`.

**Google:** Create an OAuth client at [console.cloud.google.com](https://console.cloud.google.com) > APIs & Services > Credentials, add redirect URI `http://localhost:3003/api/auth/callback/google`, copy the client ID and secret into `.env`.

For production, add `AUTH_URL=https://your-domain.com` to the environment. NextAuth v5 requires this explicitly (unlike v4 which inferred it).

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (port 3003) |
| `npm run build` | Build for production |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:generate` | Create a new migration |
| `npm run db:studio` | Open Prisma Studio |
| `npm run typecheck` | Run TypeScript type check |
| `npm run lint` | Run ESLint |

## Architecture

T3 stack: Next.js 15 App Router, tRPC v11, Prisma + PostgreSQL, NextAuth v5.

Routers in `src/server/api/routers/` are thin — they handle input validation and pass to service functions in `src/server/api/services/` where the actual logic lives. This keeps things easy to follow and testable in isolation.

The import flow is the most involved part. It runs in two phases. First, the file is parsed client-side and sent to the server, which immediately creates non-conflicting articles (new PMIDs) and returns conflicting ones for the user to resolve. Within-batch PMID duplicates are also caught here — only the first occurrence of a new PMID is created, and the rest surface as conflicts. Second, once the user resolves each conflict (skip / overwrite / keep all, with field-level merging), the resolutions are sent back. Overwrites go through optimistic locking: each article has a `version` field, and updates use `WHERE id = ? AND version = ?`. If a collaborator edited an article between the two passes, those articles are returned as stale conflicts so the user can re-resolve with fresh data.

## Assumptions

PMID is the deduplication key within a project. Articles without a PMID (preprints, manual entries) are surfaced separately in the import UI for the user to review rather than being silently dropped or created.

The review status flow (Pending, In Review, Reviewed, Excluded) is not enforced as a strict state machine. Reviewers need flexibility to move articles around freely.

Auth is OAuth-only. Academic teams typically have institutional Google accounts, so username/password auth wasn't a priority here.

## Tradeoffs and What I'd Improve

Parsing XLSX client-side keeps the server simple but could struggle with very large files. Moving parsing server-side with a background job would be cleaner at scale, though it adds complexity (job queue, progress polling) that wasn't worth it for this scope.

Optimistic locking with a `version` field instead of a long-lived DB transaction is the right call here since user interaction happens between the two import passes. The tradeoff is it requires a re-resolve loop on conflict, but that's a better outcome than silently losing someone's edits.

`createMany` is used for bulk inserts, which is fast but means one bad row fails the whole batch. Rows are validated before hitting the DB so this hasn't been an issue, but switching to individual inserts with per-row error reporting would be more resilient.

The "Keep All" resolution currently creates one merged article per conflict group regardless of how many incoming entries there are. If a user wanted to keep all three incoming entries as separate articles, they'd need to do multiple imports. Reworking the UI to support per-entry resolution within a group would fix this but needs a fair bit of redesign.

I'd also add E2E tests for the import flow with Playwright — the two-pass stateful interaction is hard to cover with unit tests alone. And the four-status review model would ideally be configurable per project rather than hardcoded.

## Tests

No automated tests were added. The highest-value targets would be the `importArticles` service (two-phase flow, PMID deduplication, stale conflict handling) and the `buildEntries` / `getMergedRow` functions in the import dialog — all near-pure logic that would be straightforward to cover with Vitest.

## AI Usage

I used Claude Code throughout this project as a development partner. That meant using it for planning and thinking through tricky design decisions (like how to handle optimistic locking across a user-interaction gap, or how to model field-level source selection across multiple incoming entries), not just code generation. I'd review what it produced, push back when something felt off, and iterate. The parts I found most valuable were having a second perspective on edge cases — things like within-batch PMID duplicates or the stale conflict loop — that are easy to miss when moving fast. That said, I reviewed and understood every piece of code that landed, and the architectural decisions were mine to own.

## Time Spent

Around 12–15 hours. The core CRUD, auth, and project structure came together quickly. The import flow took the bulk of the time — the conflict resolution UI went through several iterations, and the optimistic locking needed careful thought. Debugging a production OAuth issue (NextAuth v5 silently failing without `AUTH_URL`) and polishing the UX added a few more hours.
