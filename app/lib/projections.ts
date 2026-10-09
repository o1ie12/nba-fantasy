export type ProjectionStats = { fgm?: number; fga?: number; ftm?: number; fta?: number; pts?: number; reb?: number; ast?: number; threes?: number; stl?: number; blk?: number; to?: number; dd?: number | null; td?: number | null }

export type NormalizedProjection = ProjectionStats & { fgPct?: number; ftPct?: number; source: string; season: string; kind: 'projection' | 'historical' | 'estimated'; fetchedAt: string; playerId: string }

export function volumeWeightedPercent(rows: ProjectionStats[], made: 'fgm' | 'ftm', attempted: 'fga' | 'fta') {
  const totals = rows.reduce((result, row) => ({ made: result.made + (row[made] || 0), attempted: result.attempted + (row[attempted] || 0) }), { made: 0, attempted: 0 })
  return totals.attempted ? totals.made / totals.attempted : null
}

export function normalizeProjection(row: ProjectionStats & { playerId: string; fetchedAt: string }): NormalizedProjection {
  return { ...row, fgPct: row.fga ? (row.fgm || 0) / row.fga : undefined, ftPct: row.fta ? (row.ftm || 0) / row.fta : undefined, source: 'ESPN player projections', season: '2026-27', kind: 'projection', fetchedAt: row.fetchedAt, dd: row.dd ?? null, td: row.td ?? null }
}
