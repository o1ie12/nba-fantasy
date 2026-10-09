import assert from 'node:assert/strict'
import test from 'node:test'
import { recommendPlayers } from '../app/lib/recommendations.ts'

const players = [
  { rank: 1, name: 'Top Guard', positions: 'PG', note: 'PTS / AST' },
  { rank: 4, name: 'Center Fit', positions: 'C', note: 'REB / BLK / DD' },
  { rank: 8, name: 'Shooter', positions: 'SG', note: '3PM / FT% / STL' },
  { rank: 12, name: 'Risky Big', positions: 'C', note: 'REB / BLK', risk: true },
]

test('roster fit can beat raw rank when center is still needed', () => {
  const result = recommendPlayers({ available: players, roster: { names: [], needs: ['C'], categoryNeeds: ['BLK'] }, strategy: 'Balanced' })
  assert.equal(result[0].player.name, 'Center Fit')
})

test('DD/TD-heavy mode changes the order when the profile warrants it', () => {
  const result = recommendPlayers({ available: players, roster: { names: [], needs: [], categoryNeeds: [] }, strategy: 'DD/TD-heavy' })
  assert.equal(result[0].player.name, 'Center Fit')
})

test('opportunistic mode favors shooting and free throws', () => {
  const result = recommendPlayers({ available: players, roster: { names: [], needs: [], categoryNeeds: [] }, strategy: 'Opportunistic punt' })
  assert.equal(result[0].player.name, 'Shooter')
})

test('drafted players are excluded by the caller before ranking', () => {
  const result = recommendPlayers({ available: players.filter(player => player.name !== 'Top Guard'), roster: { names: [], needs: [], categoryNeeds: [] }, strategy: 'Balanced' })
  assert.ok(result.every(item => item.player.name !== 'Top Guard'))
})

test('risk is visible in recommendation reasons', () => {
  const result = recommendPlayers({ available: [players[3]], roster: { names: [], needs: [], categoryNeeds: [] }, strategy: 'Balanced' })
  assert.ok(result[0].reasons.includes('risk flag'))
})
