# NBA Fantasy Draft Companion

Minimal Oct 11, 2026 live-draft workspace for a 12-team ESPN fantasy basketball league.

## What works now

- Draft-board search using the supplied 2026-27 PDF's ADP ranks 1-40.
- Manual logging for your picks and other teams' picks.
- Local browser persistence via `localStorage`, including undo and clear.
- Recommendation modes: Balanced, DD/TD-heavy, and Opportunistic punt.
- Roster slots, pick timing, connection/freshness state, and explicit missing-data labels.
- Server-side `/api/espn` boundary for public player reads plus optional league draft/settings reads.

The app does not invent projections, live ESPN state, injuries, or category totals. The category panel remains blank until a tested source is connected. Percentage categories must be volume-weighted and turnovers are treated as negative, per the draft board.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Configuration

Copy `.env.example` to `.env.local` to enable league sync. `ESPN_LEAGUE_ID` is required for draft/settings reads; `ESPN_S2` and `ESPN_SWID` are only needed if ESPN rejects private-league reads. Never expose ESPN cookies or Supabase service-role credentials to browser code. Public player reads work without credentials, but ESPN currently returns only a 50-player page from that endpoint.

The UI's **Sync ESPN** button calls the server route, never ESPN directly from the browser. A failed or unconfigured sync leaves the manual board intact and visible.

## Verification

`npm run build` passes. The GitHub repository is connected as `origin`; no production database migration or secret has been added.
the ultimate tool for nba espn fantasy
