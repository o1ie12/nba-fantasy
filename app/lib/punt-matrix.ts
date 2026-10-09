import { profileForPlayer, type Category, type RecommendationPlayer, type Strategy } from './recommendations.ts'

export const matrixStrategies: Strategy[] = ['Balanced', 'Punt FT%', 'Punt AST', 'Punt 3PM', 'Punt PTS', 'DD/TD-heavy']
export type MatrixRating = 'Favorable' | 'Viable' | 'Weak' | 'Insufficient Data'

export function restoreStrategy(value: unknown): Strategy {
  return typeof value === 'string' && matrixStrategies.includes(value as Strategy) ? value as Strategy : 'Balanced'
}

export type MatrixRow = {
  strategy: Strategy
  rating: MatrixRating
  reasoning: string
  sacrifices: string
  priorities: string
  target: string
}

const targetCategories: Record<Strategy, { sacrifice: string; priority: string; categories: Category[]; archetype: string }> = {
  Balanced: { sacrifice: 'No forced punt', priority: 'Overall value and category balance', categories: [], archetype: 'multi-category value' },
  'Punt FT%': { sacrifice: 'FT%', priority: 'PTS, REB, BLK, DD/TD', categories: ['PTS', 'REB', 'BLK', 'DD', 'TD'], archetype: 'high-impact bigs with REB/BLK/DD notes' },
  'Punt AST': { sacrifice: 'AST', priority: 'PTS, REB, STL, BLK', categories: ['PTS', 'REB', 'STL', 'BLK'], archetype: 'scoring wings and defensive bigs' },
  'Punt 3PM': { sacrifice: '3PM', priority: 'PTS, REB, AST, BLK', categories: ['PTS', 'REB', 'AST', 'BLK'], archetype: 'inside scorers and playmaking bigs' },
  'Punt PTS': { sacrifice: 'PTS', priority: 'AST, REB, STL, BLK', categories: ['AST', 'REB', 'STL', 'BLK'], archetype: 'all-around distributors and defensive specialists' },
  'DD/TD-heavy': { sacrifice: 'No category forced yet', priority: 'DD/TD with REB, AST, BLK support', categories: ['DD', 'TD', 'REB', 'AST', 'BLK'], archetype: 'frontcourt multi-category players' },
  'Opportunistic punt': { sacrifice: 'The weakest emerging category', priority: '3PM, FT%, STL', categories: ['3PM', 'FT%', 'STL'], archetype: 'efficient perimeter value' },
}

function signals(player: RecommendationPlayer) {
  const profile = profileForPlayer(player)
  const note = (player.note || '').toUpperCase()
  if (note.includes('DD')) profile.DD = 1
  if (note.includes('TD')) profile.TD = 1
  return profile
}

export function buildPuntMatrix(available: RecommendationPlayer[], rosterNames: string[]): MatrixRow[] {
  const draftedCount = rosterNames.length
  const giannisOnRoster = rosterNames.includes('Giannis Antetokounmpo')
  const ftPath = available.filter(player => targetCategories['Punt FT%'].categories.some(category => signals(player)[category])).length
  const ddTargets = available.filter(player => Boolean(signals(player).DD || signals(player).TD)).sort((a, b) => a.rank - b.rank)

  return matrixStrategies.map(strategy => {
    const config = targetCategories[strategy]
    let rating: MatrixRating = 'Insufficient Data'
    let reasoning = 'The available board is heuristic and does not provide validated category totals.'
    let target = 'Wait for more roster or player evidence.'

    if (strategy === 'Balanced') {
      rating = available.length ? 'Favorable' : 'Insufficient Data'
      reasoning = available.length ? 'Best default while the roster is still forming; preserves early-round player value.' : 'No available board data remains.'
      target = available.length ? 'Best overall value with multi-category notes' : 'No supported target'
    } else if (draftedCount < 3) {
      reasoning = 'Too early to force a punt from one or two picks; keep Balanced selected unless the roster develops a clear pattern.'
      target = 'Keep taking value; reassess after the next roster additions.'
    } else if (strategy === 'Punt FT%') {
      if (giannisOnRoster && ftPath > 0) {
        rating = 'Viable'
        reasoning = 'Giannis is a meaningful FT%-weak-big signal, and the available board still shows several paths to compete elsewhere. This is directional, not projection-backed.'
        target = config.archetype
      } else {
        reasoning = 'The roster does not yet contain enough reliable FT%-weak evidence to justify conceding the category.'
      }
    } else if (strategy === 'DD/TD-heavy') {
      if (ddTargets.length && ddTargets[0].rank <= 60) {
        rating = 'Viable'
        reasoning = 'The available board contains a reasonably ranked DD/TD note, but overall value still controls the decision.'
        target = config.archetype
      } else if (ddTargets.length) {
        rating = 'Weak'
        reasoning = 'DD/TD notes exist, but the better-supported options are too far down the current board to force this path.'
      } else {
        reasoning = 'No sufficiently strong DD/TD evidence is available in the current notes.'
      }
    } else {
      const supportedTargets = available.filter(player => config.categories.some(category => Boolean(signals(player)[category]))).length
      if (supportedTargets >= 3) {
        rating = 'Viable'
        reasoning = `There are ${supportedTargets} available players with notes supporting the ${strategy} path, but no validated category totals.`
        target = config.archetype
      } else if (supportedTargets > 0) {
        rating = 'Weak'
        reasoning = `Only ${supportedTargets} available player note${supportedTargets === 1 ? '' : 's'} support the ${strategy} path; the remaining draft opportunity is too uncertain.`
      } else {
        reasoning = `The current roster and available notes do not support a confident ${strategy} decision.`
      }
    }

    return { strategy, rating, reasoning, sacrifices: config.sacrifice, priorities: config.priority, target }
  })
}
