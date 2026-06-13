import { describe, expect, it } from 'vitest'
import {
  getFootballDataResult,
  mapFootballDataStatus,
} from './mapper'
import type { FootballDataMatch } from './schema'

describe('football-data.org mapper', () => {
  it.each([
    ['TIMED', 'SCHEDULED'],
    ['IN_PLAY', 'LIVE'],
    ['FINISHED', 'FINISHED'],
    ['POSTPONED', 'POSTPONED'],
  ] as const)('maps %s to %s', (providerStatus, status) => {
    expect(mapFootballDataStatus(providerStatus)).toBe(status)
  })

  it('removes penalty shootout goals from the prediction result', () => {
    const match = createMatch({
      duration: 'PENALTY_SHOOTOUT',
      fullTime: { home: 6, away: 5 },
      penalties: { home: 5, away: 4 },
    })

    expect(getFootballDataResult(match)).toEqual({ home: 1, away: 1 })
  })
})

function createMatch(score: FootballDataMatch['score']): FootballDataMatch {
  return {
    id: 1,
    utcDate: '2026-06-13T18:00:00Z',
    status: 'FINISHED',
    area: { name: 'World' },
    competition: { id: 1, name: 'Test' },
    season: { startDate: '2026-01-01' },
    homeTeam: { id: 1, name: 'Home' },
    awayTeam: { id: 2, name: 'Away' },
    score,
  }
}
