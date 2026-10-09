# NBA Fantasy Draft Companion

Minimal Oct 11, 2026 live-draft workspace for a 12-team ESPN fantasy basketball league.

## What works now

- Draft-board search using all 156 ranked rows from the supplied 2026-27 board, including ADP values and source availability flags.
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

Copy `.env.example` to `.env.local` to enable league sync. Put your ESPN `SWID` and `espn_s2` cookie values in `ESPN_SWID` and `ESPN_S2`; keep the braces around SWID if ESPN gives it to you that way. `ESPN_LEAGUE_ID` can be entered in the UI or configured here. The values are read only by the Next.js server and are never stored in browser storage or sent in the browser URL. Never expose ESPN cookies or Supabase service-role credentials to browser code. Public player reads work without credentials, but ESPN currently returns only a 50-player page from that endpoint.

The UI's **Sync ESPN** button calls the server route, never ESPN directly from the browser. A failed or unconfigured sync leaves the manual board intact and visible.

## Verification

`npm run build` passes. The GitHub repository is connected as `origin`; no production database migration or secret has been added.
the ultimate tool for nba espn fantasy
