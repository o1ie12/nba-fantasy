'use client'

import { useEffect, useMemo, useState } from 'react'

type Strategy = 'Balanced' | 'DD/TD-heavy' | 'Opportunistic punt'
type Player = { rank: number; name: string; positions: string; note?: string; risk?: boolean }

const players: Player[] = [
  { rank: 1, name: 'Nikola Jokic', positions: 'C', note: 'Anchor / DD-TD upside' },
  { rank: 2, name: 'Victor Wembanyama', positions: 'C', note: 'BLK / REB ceiling', risk: true },
  { rank: 3, name: 'Shai Gilgeous-Alexander', positions: 'PG, SG', note: 'PTS / STL / FT%' },
  { rank: 4, name: 'Luka Doncic', positions: 'PG, SG', note: 'PTS / AST / TD' },
  { rank: 5, name: 'Cade Cunningham', positions: 'PG, SG', note: 'PTS / AST' },
  { rank: 6, name: 'Giannis Antetokounmpo', positions: 'PF, C', note: 'REB / FG% / DD', risk: true },
  { rank: 7, name: 'Jayson Tatum', positions: 'SF, PF', note: 'Balanced wing' },
  { rank: 8, name: 'Anthony Edwards', positions: 'SG, SF', note: 'PTS / 3PM / STL' },
  { rank: 9, name: 'Tyrese Haliburton', positions: 'PG', note: 'AST / 3PM / FT%', risk: true },
  { rank: 10, name: 'Karl-Anthony Towns', positions: 'PF, C', note: 'PTS / REB / 3PM' },
  { rank: 11, name: 'Cooper Flagg', positions: 'SF, PF', note: 'Multi-category upside', risk: true },
  { rank: 12, name: 'Anthony Davis', positions: 'PF, C', note: 'REB / BLK / FG%', risk: true },
  { rank: 13, name: 'Scottie Barnes', positions: 'SF, PF', note: 'AST / REB / STL' },
  { rank: 14, name: 'Kevin Durant', positions: 'SF, PF', note: 'PTS / FT% / 3PM', risk: true },
  { rank: 15, name: 'Donovan Mitchell', positions: 'PG, SG', note: 'PTS / 3PM / STL' },
  { rank: 16, name: 'Jalen Brunson', positions: 'PG', note: 'PTS / AST / FT%' },
  { rank: 17, name: 'Stephen Curry', positions: 'PG', note: '3PM / FT% / PTS', risk: true },
  { rank: 18, name: 'Amen Thompson', positions: 'SG, SF', note: 'REB / AST / STL' },
  { rank: 19, name: 'Alperen Sengun', positions: 'C', note: 'REB / AST / DD' },
  { rank: 20, name: 'Jalen Johnson', positions: 'SF, PF', note: 'REB / AST / DD', risk: true },
  { rank: 21, name: 'Trae Young', positions: 'PG', note: 'AST / 3PM / FT%' },
  { rank: 22, name: 'Jaylen Brown', positions: 'SG, SF', note: 'PTS / REB / STL' },
  { rank: 23, name: 'Devin Booker', positions: 'SG, PG', note: 'PTS / 3PM / FT%' },
  { rank: 24, name: 'Jamal Murray', positions: 'PG, SG', note: 'PTS / 3PM / AST', risk: true },
  { rank: 25, name: 'Domantas Sabonis', positions: 'PF, C', note: 'REB / AST / DD' },
  { rank: 26, name: 'LaMelo Ball', positions: 'PG', note: 'AST / 3PM / STL', risk: true },
  { rank: 27, name: 'James Harden', positions: 'PG, SG', note: 'AST / 3PM / FT%' },
  { rank: 28, name: 'LeBron James', positions: 'SF, PF', note: 'AST / REB / DD', risk: true },
  { rank: 29, name: 'Chet Holmgren', positions: 'PF, C', note: 'BLK / FG% / 3PM', risk: true },
  { rank: 30, name: 'Josh Giddey', positions: 'PG, SG', note: 'REB / AST / DD' },
  { rank: 31, name: 'Kawhi Leonard', positions: 'SF, PF', note: 'STL / FG% / FT%', risk: true },
  { rank: 32, name: 'Bam Adebayo', positions: 'C', note: 'FG% / REB / AST' },
  { rank: 33, name: 'Evan Mobley', positions: 'PF, C', note: 'REB / BLK / FG%' },
  { rank: 34, name: 'Austin Reaves', positions: 'SG, SF', note: 'FT% / AST / 3PM' },
  { rank: 35, name: 'Pascal Siakam', positions: 'PF, C', note: 'PTS / REB / FG%' },
  { rank: 36, name: 'Paolo Banchero', positions: 'PF', note: 'PTS / REB / AST', risk: true },
  { rank: 37, name: 'Jalen Williams', positions: 'SG, SF', note: 'Balanced wing' },
  { rank: 38, name: 'Aaron Gordon', positions: 'SF, PF', note: 'FG% / REB / DD' },
  { rank: 39, name: 'Jalen Duren', positions: 'C', note: 'REB / FG% / DD' },
  { rank: 40, name: 'Deni Avdija', positions: 'SF, PF', note: 'REB / AST / STL' },
]

const cats = ['PTS', 'REB', 'AST', '3PM', 'STL', 'BLK', 'FG%', 'FT%', 'TO', 'DD', 'TD']
const slots = ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'UTIL', 'UTIL', 'UTIL', 'BENCH', 'BENCH', 'BENCH']

function load(key: string): string[] { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
function nextPickForSnake(overall: number, slot: number) {
  for (let candidate = overall + 1; candidate <= 156; candidate++) {
    const round = Math.floor((candidate - 1) / 12) + 1
    const roundSlot = round % 2 === 1 ? ((candidate - 1) % 12) + 1 : 12 - ((candidate - 1) % 12)
    if (roundSlot === slot) return candidate
  }
  return null
}

export default function Home() {
  const [drafted, setDrafted] = useState<string[]>([])
  const [myPicks, setMyPicks] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [strategy, setStrategy] = useState<Strategy>('Balanced')
  const [draftPosition, setDraftPosition] = useState('6')
  const [leagueId, setLeagueId] = useState('')
  const [espnS2, setEspnS2] = useState('')
  const [espnSwid, setEspnSwid] = useState('')
  const [round, setRound] = useState('1')
  const [pick, setPick] = useState('1')
  const [status, setStatus] = useState('Checking ESPN configuration…')
  const [syncReady, setSyncReady] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => { setDrafted(load('nba-drafted')); setMyPicks(load('nba-my-picks')) }, [])
  useEffect(() => {
    fetch('/api/espn?view=status', { cache: 'no-store' }).then(r => r.json()).then(data => {
      setSyncReady(Boolean(data.leagueConfigured && data.privateCookiesConfigured))
      setStatus(data.privateCookiesConfigured ? 'ESPN private sync ready' : data.leagueConfigured ? 'ESPN public sync ready' : 'Manual mode - add league ID')
    }).catch(() => setStatus('Manual mode - ESPN unavailable'))
  }, [])
  useEffect(() => { localStorage.setItem('nba-drafted', JSON.stringify(drafted)); localStorage.setItem('nba-my-picks', JSON.stringify(myPicks)) }, [drafted, myPicks])

  const available = useMemo(() => players.filter(p => !drafted.includes(p.name) && p.name.toLowerCase().includes(search.toLowerCase())), [drafted, search])
  const nextPick = nextPickForSnake(Number(pick), Number(draftPosition))
  const recommendations = [...available].sort((a, b) => {
    const bonus = strategy === 'DD/TD-heavy' ? (p: Player) => p.note?.includes('DD') ? -2 : 0 : strategy === 'Opportunistic punt' ? (p: Player) => p.note?.includes('3PM') || p.note?.includes('FT%') ? -1 : 0 : () => 0
    return a.rank + bonus(a) - (b.rank + bonus(b))
  }).slice(0, 5)

  const addPick = (player: Player, mine: boolean) => {
    setDrafted(v => v.includes(player.name) ? v : [...v, player.name])
    if (mine) setMyPicks(v => v.includes(player.name) ? v : [...v, player.name])
    setStatus(`${player.name} logged${mine ? ' to your roster' : ''}`)
  }
  const undo = () => { const last = drafted[drafted.length - 1]; if (!last) return; setDrafted(drafted.slice(0, -1)); setMyPicks(myPicks.filter(x => x !== last)); setStatus(`Undid ${last}`) }
  const syncEspn = async () => {
    setSyncing(true)
    try {
      const response = espnS2 || espnSwid
        ? await fetch('/api/espn', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leagueId, espnS2, espnSwid }) })
        : await fetch(`/api/espn?view=draft${leagueId ? `&leagueId=${encodeURIComponent(leagueId)}` : ''}`, { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'ESPN sync failed')
      setStatus(`ESPN synced · ${data.picks?.filter((p: { drafted: boolean }) => p.drafted).length || 0} drafted picks`)
    } catch (error) {
      setStatus(`${error instanceof Error ? error.message : 'ESPN sync failed'} · manual mode`)
    } finally { setSyncing(false) }
  }

  return <main>
    <header className="topbar"><div><span className="eyebrow">OCT 11 / 2026-27</span><h1>Draft Companion</h1></div><div className="connection"><span className="dot" /> {status}<small>{syncReady ? 'ESPN sync ready' : 'Manual fallback available'}</small></div></header>
    <section className="hero"><div><p className="eyebrow">LIVE DRAFT WORKSPACE</p><h2>Make the next pick with a clear board.</h2><p className="muted">Real ADP board loaded from your draft-board PDF. ESPN sync is server-side and optional; manual entry remains available when credentials or league state are unavailable.</p></div><div className="controls"><label>League ID <input value={leagueId} onChange={e=>setLeagueId(e.target.value)} placeholder="e.g. 123456789" inputMode="numeric" /></label><label>Draft slot <select value={draftPosition} onChange={e => setDraftPosition(e.target.value)}>{Array.from({length:12},(_,i)=><option key={i}>{i+1}</option>)}</select></label><label>Round <input value={round} onChange={e=>setRound(e.target.value)} type="number" min="1" max="13" /></label><label>Pick <input value={pick} onChange={e=>setPick(e.target.value)} type="number" min="1" max="156" /></label><button onClick={syncEspn} disabled={syncing}>{syncing ? 'Syncing…' : 'Sync ESPN'}</button></div></section>
    <details className="private"><summary>Private ESPN sync credentials</summary><p>Optional local-only inputs. They are held in memory and sent only to this local server during sync; they are not saved to the browser.</p><label>ESPN S2 <input type="password" value={espnS2} onChange={e=>setEspnS2(e.target.value)} autoComplete="off" /></label><label>ESPN SWID <input type="password" value={espnSwid} onChange={e=>setEspnSwid(e.target.value)} autoComplete="off" /></label></details>
    <div className="stats"><div><span>YOUR PICKS</span><strong>{myPicks.length} / 13</strong></div><div><span>PLAYERS LOGGED</span><strong>{drafted.length}</strong></div><div><span>NEXT PICK / SNAKE</span><strong>{nextPick || '—'}</strong></div><div><span>DATA FRESHNESS</span><strong className="amber">Manual</strong></div></div>
    <div className="layout"><section className="panel board"><div className="panelhead"><div><p className="eyebrow">PLAYER BOARD</p><h3>Available now</h3></div><input className="search" placeholder="Search player" value={search} onChange={e=>setSearch(e.target.value)} /></div><div className="boardhead"><span>ADP</span><span>PLAYER</span><span>PROFILE</span><span>ACTION</span></div>{available.map(p=><div className="player" key={p.name}><b>{String(p.rank).padStart(2,'0')}</b><div><strong>{p.name}</strong><small>{p.positions}{p.risk ? ' · risk flag' : ''}</small></div><span className="profile">{p.note}</span><div className="actions"><button onClick={()=>addPick(p,true)}>My pick</button><button className="ghost" onClick={()=>addPick(p,false)}>Log drafted</button></div></div>)}{available.length===0 && <div className="empty">No available player matches this search.</div>}</section>
      <aside className="side"><section className="panel"><div className="panelhead"><div><p className="eyebrow">RECOMMENDATIONS</p><h3>For pick {pick}</h3></div></div><div className="strategy">{(['Balanced','DD/TD-heavy','Opportunistic punt'] as Strategy[]).map(s=><button key={s} className={strategy===s?'selected':''} onClick={()=>setStrategy(s)}>{s}</button>)}</div>{recommendations.map((p,i)=><div className="recommend" key={p.name}><div className="rank">{i+1}</div><div><strong>{p.name}</strong><small>ADP {p.rank} · {p.positions}</small><p>{p.note}. {strategy === 'Balanced' ? 'Protects multi-category balance.' : strategy === 'DD/TD-heavy' ? 'Adds repeatable frontcourt counting-stat upside.' : 'Useful if the roster is intentionally conceding a weaker category.'}</p></div></div>)}</section>
      <section className="panel"><p className="eyebrow">YOUR ROSTER</p><h3>Slots & category lens</h3><div className="slots">{slots.map((slot,i)=><div key={i}><span>{slot}</span><b>{myPicks[i] || 'Open'}</b></div>)}</div><div className="categorygrid">{cats.map(c=><span key={c}>{c}<b>—</b></span>)}</div><p className="footnote">Category totals are intentionally blank until projections or player stats are connected. Percentages must be volume-weighted; TO is negative.</p></section></aside></div>
    <footer><span>Source: your 2026-27 draft-board PDF · ADP is a timing reference, not a projection.</span><button onClick={undo}>Undo last log</button><button className="danger" onClick={()=>{setDrafted([]);setMyPicks([]);setStatus('Board cleared')}}>Clear board</button></footer>
  </main>
}
