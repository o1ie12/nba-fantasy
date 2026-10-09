'use client'

import { useEffect, useState } from 'react'

export default function HomeDashboard() {
  const [status, setStatus] = useState('Checking ESPN…')
  const [drafted, setDrafted] = useState<string[]>([])
  const [myPicks, setMyPicks] = useState<string[]>([])

  useEffect(() => {
    try {
      setDrafted(JSON.parse(localStorage.getItem('nba-drafted') || '[]'))
      setMyPicks(JSON.parse(localStorage.getItem('nba-my-picks') || '[]'))
    } catch { /* empty local state */ }
    fetch('/api/espn?view=status', { cache: 'no-store' })
      .then(response => response.json())
      .then(data => setStatus(data.privateCookiesConfigured ? 'ESPN credentials configured' : 'Manual mode available'))
      .catch(() => setStatus('ESPN unavailable · manual mode available'))
  }, [])

  return <main className="dashboard">
    <header className="topbar"><div><span className="eyebrow">OCT 11 / 2026-27</span><h1>Fantasy Hub</h1><nav><a href="/home">Home</a><a href="/">Draft Assistant</a></nav></div><div className="connection"><span className="dot" /> {status}<small>Local workspace · no secrets displayed</small></div></header>
    <section className="dashboardHero"><p className="eyebrow">HOME</p><h2>Your draft, at a glance.</h2><p className="muted">Start with the live board, then return here for roster and sync status.</p><a className="primaryLink" href="/">Open Draft Assistant →</a></section>
    <div className="stats"><div><span>YOUR PICKS</span><strong>{myPicks.length} / 13</strong></div><div><span>PLAYERS LOGGED</span><strong>{drafted.length}</strong></div><div><span>ESPN</span><strong className="amber">{status.startsWith('ESPN') ? 'Ready' : 'Fallback'}</strong></div></div>
    <section className="dashboardGrid"><div className="panel"><p className="eyebrow">YOUR ROSTER</p><h3>{myPicks.length ? 'Current picks' : 'No picks yet'}</h3>{myPicks.length ? <ul>{myPicks.map(name => <li key={name}>{name}</li>)}</ul> : <p className="muted">Your roster will appear after you mark players as “My pick”.</p>}</div><div className="panel"><p className="eyebrow">NEXT ACTION</p><h3>Prepare the next pick</h3><p className="muted">Sync ESPN when your private draft is active, or use manual logging if the connection is unavailable.</p><a className="primaryLink" href="/">Go to board →</a></div></section>
  </main>
}
