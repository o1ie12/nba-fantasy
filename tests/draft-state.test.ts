import assert from 'node:assert/strict'
import test from 'node:test'
import { classifyDraftStatus, normalizeEspnPicks, reconcileEspnPicks, unavailableNames, undoManualPick } from '../app/lib/draft-state.ts'

const pick = (playerId: string, playerName: string) => ({ playerId, playerName, drafted: true })

test('successful ESPN refresh replaces old picks and deduplicates by identifier', () => {
  const first = reconcileEspnPicks([], [pick('1', 'One'), pick('2', 'Two')])
  const second = reconcileEspnPicks(first.picks, [pick('2', 'Two'), pick('3', 'Three'), pick('3', 'Three')])
  assert.deepEqual(second.picks, [{ playerId: '2', playerName: 'Two' }, { playerId: '3', playerName: 'Three' }])
})

test('manual picks survive ESPN refresh and shared players remain unavailable', () => {
  const names = unavailableNames(['Manual Player', 'Shared Player'], [{ playerId: '7', playerName: 'Shared Player' }])
  assert.deepEqual([...names].sort(), ['Manual Player', 'Shared Player'])
  assert.equal(names.has('Shared Player'), true)
})

test('undo removes only the manual source, leaving an ESPN-confirmed player unavailable', () => {
  const result = undoManualPick(['Shared Player'], ['Shared Player'])
  const remaining = unavailableNames(result.manualNames, [{ playerId: '7', playerName: 'Shared Player' }])
  assert.equal(result.last, 'Shared Player')
  assert.equal(remaining.has('Shared Player'), true)
})

test('invalid ESPN data preserves the last valid set', () => {
  const previous = [{ playerId: '1', playerName: 'One' }]
  const result = reconcileEspnPicks(previous, [ { drafted: true } ])
  assert.equal(result.valid, false)
  assert.deepEqual(result.picks, previous)
})

test('picks without identifiers or names are incomplete, not an empty draft', () => {
  const result = normalizeEspnPicks([{ drafted: true }])
  assert.equal(result.valid, false)
  assert.equal(result.unresolvedDrafted, 1)
})

test('draft status only classifies states supported by ESPN fields', () => {
  assert.equal(classifyDraftStatus(false, false), 'not-started')
  assert.equal(classifyDraftStatus(true, false), 'in-progress')
  assert.equal(classifyDraftStatus(false, true), 'finished')
  assert.equal(classifyDraftStatus(undefined, undefined), 'unknown')
})
