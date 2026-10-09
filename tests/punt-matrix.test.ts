import assert from 'node:assert/strict'
import test from 'node:test'
import { buildPuntMatrix, restoreStrategy } from '../app/lib/punt-matrix.ts'

const board = [
  { rank: 1, name: 'Giannis Antetokounmpo', positions: 'PF, C', note: 'REB / FG% / DD' },
  { rank: 15, name: 'Big Target', positions: 'PF, C', note: 'REB / BLK / DD' },
  { rank: 22, name: 'Wing', positions: 'SG, SF', note: 'PTS / STL / 3PM' },
  { rank: 30, name: 'Distributor', positions: 'PG', note: 'AST / REB / STL' },
]

test('Balanced is the first default matrix row and does not auto-select another path', () => {
  assert.equal(buildPuntMatrix(board, [])[0].strategy, 'Balanced')
  assert.equal(buildPuntMatrix(board, [])[0].rating, 'Favorable')
})

test('early roster does not force a punt', () => {
  const row = buildPuntMatrix(board, ['Giannis Antetokounmpo']).find(item => item.strategy === 'Punt FT%')
  assert.equal(row?.rating, 'Insufficient Data')
})

test('Giannis-led developed roster can make Punt FT% viable without certainty', () => {
  const row = buildPuntMatrix(board, ['Giannis Antetokounmpo', 'Wing', 'Distributor']).find(item => item.strategy === 'Punt FT%')
  assert.equal(row?.rating, 'Viable')
  assert.match(row?.reasoning || '', /directional, not projection-backed/)
})

test('missing category evidence stays insufficient', () => {
  const rows = buildPuntMatrix([{ rank: 1, name: 'Unknown', note: 'Lower-confidence market row' }], ['A', 'B', 'C'])
  assert.equal(rows.find(item => item.strategy === 'Punt AST')?.rating, 'Insufficient Data')
})

test('manual strategy selection restores when valid and defaults to Balanced otherwise', () => {
  assert.equal(restoreStrategy('Punt AST'), 'Punt AST')
  assert.equal(restoreStrategy('not-a-strategy'), 'Balanced')
})
