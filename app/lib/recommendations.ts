export type Strategy = 'Balanced' | 'DD/TD-heavy' | 'Opportunistic punt'
export type Category = 'PTS' | 'REB' | 'AST' | '3PM' | 'STL' | 'BLK' | 'FG%' | 'FT%' | 'TO' | 'DD' | 'TD'

export type RecommendationPlayer = {
  rank: number
  name: string
  positions?: string
  note?: string
  risk?: boolean
  adp?: number
  profile?: Partial<Record<Category, number>>
}

export type RecommendationRoster = {
  names: string[]
  needs: string[]
  categoryNeeds: Category[]
}

const categoryFromNote = (note = '') => note.split('/').map(value => value.trim()).filter(Boolean) as Category[]

export function profileForPlayer(player: RecommendationPlayer): Partial<Record<Category, number>> {
  if (player.profile) return player.profile
  const profile: Partial<Record<Category, number>> = {}
  for (const category of categoryFromNote(player.note)) profile[category] = 1
  return profile
}

export function recommendPlayers(input: {
  available: RecommendationPlayer[]
  roster: RecommendationRoster
  strategy: Strategy
  limit?: number
}) {
  const { available, roster, strategy, limit = 5 } = input
  return available.map(player => {
    const profile = profileForPlayer(player)
    const categoryFit = roster.categoryNeeds.reduce((score, category) => score + (profile[category] || 0) * 5, 0)
    const positionFit = roster.needs.some(position => player.positions?.split(',').map(x => x.trim()).includes(position)) ? 8 : 0
    const riskPenalty = player.risk ? 3 : 0
    const strategyFit = strategy === 'DD/TD-heavy'
      ? ((profile.DD || 0) + (profile.TD || 0)) * 8
      : strategy === 'Opportunistic punt'
        ? ((profile['3PM'] || 0) + (profile['FT%'] || 0) + (profile.STL || 0)) * 5
        : Object.keys(profile).length * 2
    const score = 100 - player.rank + categoryFit + positionFit + strategyFit - riskPenalty
    const reasons = [
      categoryFit ? `repairs ${roster.categoryNeeds.filter(category => profile[category]).join('/')}` : '',
      positionFit ? `fills ${roster.needs.find(position => player.positions?.includes(position))}` : '',
      strategy === 'DD/TD-heavy' && (profile.DD || profile.TD) ? 'adds DD/TD profile' : '',
      strategy === 'Opportunistic punt' && (profile['3PM'] || profile['FT%']) ? 'supports the opportunistic path' : '',
      player.risk ? 'risk flag' : '',
    ].filter(Boolean)
    return { player, score, reasons }
  }).sort((a, b) => b.score - a.score || a.player.rank - b.player.rank).slice(0, limit)
}
