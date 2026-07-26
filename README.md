# Betme

A social predictive market where users post predictions, others stake YES/NO
with credits, and **accurate predictors earn a bigger share** — both of the
on-platform prize pool and of shared **ad revenue**.

## Features

- **Prediction markets** — post markets (with optional close dates), stake YES/NO, and resolve. Winners get their stake back plus a proportional share of the losing pool.
- **Leaderboard** ranked by **Net earnings** and win rate.
- **Profiles & stats** — Net earnings, win rate, total staked, ad earnings, badges, editable profile.
- **My bets** — your portfolio of stakes with per-bet Net earnings.
- **Prediction chat**, **direct messaging**, and **video messages**.
- **Following** and **notifications** (follows, comments on your markets, resolutions, DMs).
- **Ad revenue sharing** — impressions on a market accrue revenue to its creator and participants, weighted so accurate predictors earn more.

## Local development

```bash
npm install          # installs deps and generates the Prisma client
npm run db:push      # create/sync the local SQLite database
npm run db:seed      # load demo data (optional; wipes existing rows)
npm run dev          # http://localhost:3000
```

Other scripts: `npm run lint`, `npm test`, `npm run build`.

## Deployment & ads

### Deploy to Render

The repo includes a [`render.yaml`](./render.yaml) Blueprint that deploys the app
as a single Node web service with a **persistent disk** for the SQLite database.

1. Push this repo to GitHub (done).
2. In Render, create a new **Blueprint** from the repo and apply it. Render reads `render.yaml`.
3. The disk-backed SQLite DB requires a paid instance type (the free tier's filesystem is ephemeral and will lose data on restart).
4. `startCommand` runs `prisma db push` on boot to create/sync the schema on the disk, then starts Next.js.

> Note: SQLite on a single persistent disk is simple and works for one instance.
> To scale horizontally, migrate the Prisma datasource to Postgres (Render
> offers managed Postgres) and set `DATABASE_URL` accordingly.

### Enable real ads (Google AdSense)

Ad slots render a house placeholder until an AdSense client id is configured.

1. Create/approve a **Google AdSense** account and get your publisher id (`ca-pub-…`). Approval and payouts are handled by Google and are required for real revenue.
2. Set `NEXT_PUBLIC_ADSENSE_CLIENT` (e.g. in the Render dashboard, or `.env` locally). See [`.env.example`](./.env.example).
3. Ad units then load via AdSense; the revenue-sharing accrual runs regardless so creators/participants earn a share per impression.
