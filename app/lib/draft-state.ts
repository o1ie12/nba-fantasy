export type DraftStatus = 'not-started' | 'in-progress' | 'finished' | 'unknown'

export type SourcedPick = {
  playerId: string | null
  playerName: string | null
}

type RawPick = {
  playerId?: unknown
  playerName?: unknown
  drafted?: unknown
}

export function normalizeEspnPicks(value: unknown): { valid: boolean; picks: SourcedPick[]; unresolvedDrafted: number } {
  if (!Array.isArray(value)) return { valid: false, picks: [], unresolvedDrafted: 0 }
  const picks: SourcedPick[] = []
  const seen = new Set<string>()
  let unresolvedDrafted = 0
  for (const raw of value as RawPick[]) {
    if (raw.drafted !== true) continue
    const playerId = typeof raw.playerId === 'string' || typeof raw.playerId === 'number' ? String(raw.playerId) : null
    const playerName = typeof raw.playerName === 'string' && raw.playerName.trim() ? raw.playerName.trim() : null
    if (!playerId && !playerName) {
      unresolvedDrafted += 1
      continue
    }
    const key = playerId || `name:${playerName!.toLocaleLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    picks.push({ playerId, playerName })
  }
  return { valid: unresolvedDrafted === 0, picks, unresolvedDrafted }
}

export function reconcileEspnPicks(previous: SourcedPick[], value: unknown): { picks: SourcedPick[]; valid: boolean } {
  const normalized = normalizeEspnPicks(value)
  return normalized.valid ? { picks: normalized.picks, valid: true } : { picks: previous, valid: false }
}

export function unavailableNames(manualNames: string[], espnPicks: SourcedPick[]) {
  return new Set([...manualNames, ...espnPicks.map(pick => pick.playerName).filter((name): name is string => Boolean(name))])
}

export function undoManualPick(manualNames: string[], myPicks: string[]) {
  const last = manualNames[manualNames.length - 1]
  return last ? { manualNames: manualNames.slice(0, -1), myPicks: myPicks.filter(name => name !== last), last } : { manualNames, myPicks, last: null }
}

export function classifyDraftStatus(inProgress: unknown, finished: unknown): DraftStatus {
  if (inProgress === true) return 'in-progress'
  if (inProgress === false && finished === true) return 'finished'
  if (inProgress === false && finished === false) return 'not-started'
  return 'unknown'
}
