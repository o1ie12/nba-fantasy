import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeProjection, volumeWeightedPercent } from '../app/lib/projections.ts'

test('percentage totals are volume weighted, not averaged', () => {
  assert.equal(volumeWeightedPercent([{ fgm: 1, fga: 1 }, { fgm: 50, fga: 100 }], 'fgm', 'fga'), 51 / 101)
})

test('future projections keep DD and TD explicit when unavailable', () => {
  const row = normalizeProjection({ playerId: '1', fgm: 5, fga: 10, fetchedAt: '2026-10-09T00:00:00Z' })
  assert.equal(row.kind, 'projection')
  assert.equal(row.dd, null)
  assert.equal(row.td, null)
  assert.equal(row.fgPct, 0.5)
})
