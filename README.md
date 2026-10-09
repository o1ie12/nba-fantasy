# NBA Fantasy Draft Companion

Minimal Oct 11, 2026 live-draft workspace for a 12-team ESPN fantasy basketball league.

## What works now

- Draft-board search using the supplied 2026-27 PDF's ADP ranks 1-40.
- Manual logging for your picks and other teams' picks.
- Local browser persistence via `localStorage`, including undo and clear.
- Recommendation modes: Balanced, DD/TD-heavy, and Opportunistic punt.
- Roster slots, pick timing, connection/freshness state, and explicit missing-data labels.

The app does not invent projections, live ESPN state, injuries, or category totals. The category panel remains blank until a tested source is connected. Percentage categories must be volume-weighted and turnovers are treated as negative, per the draft board.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Configuration

Copy `.env.example` to `.env.local` only if a server-side ESPN integration is added. Never expose ESPN cookies or Supabase service-role credentials to browser code. The current Oct 11 fallback does not require credentials or Supabase.

## Verification

`npm run build` passes. The GitHub repository is connected as `origin`; no production database migration or secret has been added.
the ultimate tool for nba espn fantasy
