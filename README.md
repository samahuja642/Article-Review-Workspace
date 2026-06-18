# Article Review Workspace

A collaborative platform for managing and reviewing academic articles, built with Next.js, tRPC, Prisma, and NextAuth.

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [npm](https://www.npmjs.com/) v10+
- [PostgreSQL](https://www.postgresql.org/) v14+ running locally

## Local Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd article-review-workspace
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/article-review-workspace"

# NextAuth secret — generate with: npx auth secret
AUTH_SECRET="your-secret-here"

# Discord OAuth
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"

# Google OAuth
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

### 4. Set up the database

Create the database, then run migrations:

```bash
createdb article-review-workspace   # or create it via psql / pgAdmin
npm run db:migrate
```

### 5. Start the dev server

```bash
npm run dev
```

The app runs at [http://localhost:3003](http://localhost:3003).

---

## OAuth Setup

### Discord

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications) → New Application
2. OAuth2 → Add redirect: `http://localhost:3003/api/auth/callback/discord`
3. Copy **Client ID** and **Client Secret** into `.env`

### Google

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → Create OAuth client
2. Add authorized redirect URI: `http://localhost:3003/api/auth/callback/google`
3. Copy **Client ID** and **Client Secret** into `.env`

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (port 3003) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:generate` | Create a new migration |
| `npm run db:studio` | Open Prisma Studio |
| `npm run typecheck` | Run TypeScript type check |
| `npm run lint` | Run ESLint |

---

## Tech Stack

- **Framework** — [Next.js 15](https://nextjs.org/) (App Router)
- **API** — [tRPC 11](https://trpc.io/)
- **Database ORM** — [Prisma](https://www.prisma.io/) with PostgreSQL
- **Auth** — [NextAuth v5](https://authjs.dev/)
- **UI** — [MUI v9](https://mui.com/) with Catppuccin theme
- **Validation** — [Zod](https://zod.dev/)
