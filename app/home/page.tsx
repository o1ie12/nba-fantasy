'use client'

import { useEffect, useState } from 'react'

type SyncState = 'loading' | 'syncing' | 'success' | 'error' | 'missing'
type Snapshot = {
  leagueName: string
  teams: number | null
  scoring: string
  roster: string
  playoffs: string
  verified: boolean
}

const fallbackSnapshot: Snapshot = {
  leagueName: 'Morrison Ballers Association',
  teams: 12,
  scoring: 'H2H Categories',
  roster: '1 PG • 1 SG • 1 SF • 1 PF • 1 C • 3 Utility • 4 BN',
  playoffs: 'Not set',
  verified: false,
}

const isMissingCredentials = (message: string) => message.includes('not configured') || message.includes('HTTP 401') || message.includes('HTTP 403')

export default function HomeDashboard() {
  const [status, setStatus] = useState<SyncState>('loading')
  const [snapshot, setSnapshot] = useState<Snapshot>(fallbackSnapshot)
  const [lastSynced, setLastSynced] = useState<string | null>(null)
  const [drafted, setDrafted] = useState<string[]>([])
  const [myPicks, setMyPicks] = useState<string[]>([])
  const [syncError, setSyncError] = useState<string | null>(null)

  const syncNow = async () => {
    setStatus('syncing')
    setSyncError(null)
    try {
      const response = await fetch('/api/espn?view=draft', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'ESPN sync failed')
      setLastSynced(data.fetchedAt || new Date().toISOString())
      setStatus('success')
    } catch (error) {
      setStatus(error instanceof Error && isMissingCredentials(error.message) ? 'missing' : 'error')
      setSyncError(error instanceof Error ? error.message : 'ESPN sync failed')
    }
  }

  useEffect(() => {
    try {
      setDrafted(JSON.parse(localStorage.getItem('nba-drafted') || '[]'))
      setMyPicks(JSON.parse(localStorage.getItem('nba-my-picks') || '[]'))
    } catch { /* empty local state */ }
    fetch('/api/espn?view=settings', { cache: 'no-store' })
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'ESPN settings unavailable')
        const settings = data.settings || {}
        const slots = settings.rosterSettings?.lineupSlotCounts || {}
        const roster = slots['0'] === 1 && slots['1'] === 1 && slots['2'] === 1 && slots['3'] === 1 && slots['4'] === 1
          ? `1 PG • 1 SG • 1 SF • 1 PF • 1 C • ${slots['11'] ?? 3} Utility • ${slots['12'] ?? 4} BN`
          : fallbackSnapshot.roster
        setSnapshot({
          leagueName: String(settings.name || fallbackSnapshot.leagueName).trim(),
          teams: Number(settings.size) || null,
          scoring: settings.scoringSettings?.scoringType === 'H2H_MOST_CATEGORIES' ? 'H2H Categories' : 'H2H Categories',
          roster,
          playoffs: settings.scheduleSettings?.playoffTeamCount ? `${settings.scheduleSettings.playoffTeamCount} teams` : 'Not set',
          verified: true,
        })
      })
      .then(() => syncNow())
      .catch(error => {
        setStatus(error instanceof Error && isMissingCredentials(error.message) ? 'missing' : 'error')
        setSyncError(error instanceof Error ? error.message : 'ESPN settings unavailable')
      })
  }, [])

  const statusLabel = status === 'loading' ? 'Loading ESPN…' : status === 'syncing' ? 'Syncing ESPN…' : status === 'success' ? 'Synced' : status === 'missing' ? 'Not configured' : 'Sync failed'
  const statusDetail = status === 'success' && lastSynced ? `Last synced ${new Date(lastSynced).toLocaleString()}` : syncError || 'No successful sync yet'

  return <main className="dashboard">
    <header className="topbar"><div><span className="eyebrow">OCT 11 / 2026-27</span><h1>Fantasy Hub</h1><nav><a href="/home">Home</a><a href="/">Draft Assistant</a></nav></div><div className="connection"><span className="dot" /> {statusLabel}<small>Local workspace · no secrets displayed</small></div></header>
    <section className="dashboardHero"><p className="eyebrow">HOME</p><h2>Your draft, at a glance.</h2><p className="muted">Start with the live board, then return here for roster and sync status.</p><a className="primaryLink" href="/">Open Draft Assistant →</a></section>
    <section className="panel leagueSnapshot"><div className="snapshotHeader"><div><p className="eyebrow">LEAGUE SNAPSHOT</p><h3>{snapshot.leagueName}</h3></div><button onClick={syncNow} disabled={status === 'loading' || status === 'syncing'}>{status === 'syncing' ? 'Syncing…' : 'Sync now'}</button></div><div className="snapshotGrid"><div><span>PLATFORM</span><strong>ESPN</strong></div><div><span>TEAMS</span><strong>{snapshot.teams ?? 'Not set'}</strong></div><div><span>SCORING</span><strong>{snapshot.scoring}</strong></div><div><span>ROSTER</span><strong>{snapshot.roster}</strong></div><div><span>PLAYOFFS</span><strong>{snapshot.playoffs}</strong></div><div><span>SYNC STATUS</span><strong className={status === 'success' ? 'green' : 'amber'}>{statusLabel}</strong><small>{statusDetail}</small></div></div><p className="snapshotNote">{snapshot.verified ? 'League details verified from ESPN settings.' : 'League details are fallback values; ESPN settings have not been verified.'}</p></section>
    <div className="stats"><div><span>YOUR PICKS</span><strong>{myPicks.length} / 13</strong></div><div><span>PLAYERS LOGGED</span><strong>{drafted.length}</strong></div><div><span>ESPN</span><strong className="amber">{status === 'success' ? 'Ready' : 'Fallback'}</strong></div></div>
    <section className="dashboardGrid"><div className="panel"><p className="eyebrow">YOUR ROSTER</p><h3>{myPicks.length ? 'Current picks' : 'No picks yet'}</h3>{myPicks.length ? <ul>{myPicks.map(name => <li key={name}>{name}</li>)}</ul> : <p className="muted">Your roster will appear after you mark players as “My pick”.</p>}</div><div className="panel"><p className="eyebrow">NEXT ACTION</p><h3>Prepare the next pick</h3><p className="muted">Sync ESPN when your private draft is active, or use manual logging if the connection is unavailable.</p><a className="primaryLink" href="/">Go to board →</a></div></section>
  </main>
}
