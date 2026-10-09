import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = process.env.ESPN_BASE_URL || 'https://lm-api-reads.fantasy.espn.com'
const season = process.env.ESPN_SEASON_ID || '2027'

function espnHeaders(credentials?: { s2?: string; swid?: string }) {
  const headers: Record<string, string> = { Accept: 'application/json' }
  const cookies = [credentials?.swid || process.env.ESPN_SWID, credentials?.s2 || process.env.ESPN_S2].filter(Boolean).map((value, index) => `${index === 0 ? 'SWID' : 'espn_s2'}=${value}`)
  if (cookies.length) headers.Cookie = cookies.join('; ')
  return headers
}

async function readEspn(path: string, credentials?: { s2?: string; swid?: string }) {
  const response = await fetch(`${BASE_URL}${path}`, { headers: espnHeaders(credentials), cache: 'no-store' })
  if (!response.ok) throw new Error(`ESPN returned HTTP ${response.status}`)
  return response.json()
}

export async function GET(request: NextRequest) {
  const view = request.nextUrl.searchParams.get('view') || 'draft'
  const leagueId = request.nextUrl.searchParams.get('leagueId') || process.env.ESPN_LEAGUE_ID

  if (view === 'status') {
    return NextResponse.json({
      source: 'server configuration',
      leagueConfigured: Boolean(leagueId),
      privateCookiesConfigured: Boolean(process.env.ESPN_S2 && process.env.ESPN_SWID),
      message: leagueId ? 'Ready to sync ESPN draft data' : 'Enter a league ID or configure ESPN_LEAGUE_ID',
    })
  }
  const fetchedAt = new Date().toISOString()

  try {
    if (view === 'players') {
      const data = await readEspn(`/apis/v3/games/fba/seasons/${season}/players?view=players_wl&view=kona_player_info`)
      const players = Array.isArray(data) ? data.map((player) => ({
        id: player.id,
        name: player.fullName,
        rank: player.draftRanksByRankType?.STANDARD?.rank ?? null,
        adp: player.ownership?.averageDraftPosition ?? null,
        positionId: player.defaultPositionId ?? null,
        injured: Boolean(player.injured),
        injuryStatus: player.injuryStatus ?? null,
      })) : []
      return NextResponse.json({ source: 'ESPN public player feed', fetchedAt, count: players.length, players })
    }

    if (!leagueId) {
      return NextResponse.json({ error: 'ESPN_LEAGUE_ID is not configured', source: 'manual fallback required' }, { status: 503 })
    }

    const base = `/apis/v3/games/fba/seasons/${season}/segments/0/leagues/${encodeURIComponent(leagueId)}`
    if (view === 'settings') {
      const data = await readEspn(`${base}?view=mSettings`)
      return NextResponse.json({ source: 'ESPN league settings', fetchedAt, leagueId, settings: data.settings ?? data })
    }

    const data = await readEspn(`${base}?view=mDraftDetail`)
    const picks = (data.draftDetail?.picks || []).map((pick: Record<string, unknown>) => ({
      overallPick: pick.overallPickNumber ?? pick.overallPick ?? null,
      teamId: pick.teamId ?? null,
      playerId: pick.playerId ?? null,
      drafted: Boolean(pick.drafted),
    }))
    return NextResponse.json({ source: 'ESPN draft detail', fetchedAt, leagueId, inProgress: Boolean(data.draftDetail?.inProgress), drafted: Boolean(data.draftDetail?.drafted), picks })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown ESPN error'
    return NextResponse.json({ error: message, source: 'manual fallback required', fetchedAt }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { leagueId?: string; espnS2?: string; espnSwid?: string }
    const leagueId = body.leagueId || process.env.ESPN_LEAGUE_ID
    if (!leagueId) return NextResponse.json({ error: 'League ID is required' }, { status: 400 })
    const data = await readEspn(`/apis/v3/games/fba/seasons/${season}/segments/0/leagues/${encodeURIComponent(leagueId)}?view=mDraftDetail`, { s2: body.espnS2, swid: body.espnSwid })
    const picks = (data.draftDetail?.picks || []).map((pick: Record<string, unknown>) => ({ overallPick: pick.overallPickNumber ?? pick.overallPick ?? null, teamId: pick.teamId ?? null, playerId: pick.playerId ?? null, drafted: Boolean(pick.drafted) }))
    return NextResponse.json({ source: 'ESPN draft detail', fetchedAt: new Date().toISOString(), leagueId, inProgress: Boolean(data.draftDetail?.inProgress), drafted: Boolean(data.draftDetail?.drafted), picks })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown ESPN error'
    return NextResponse.json({ error: message, source: 'manual fallback required' }, { status: 502 })
  }
}
