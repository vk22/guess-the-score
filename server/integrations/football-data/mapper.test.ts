import { describe, expect, it } from 'vitest'
import {
  getFootballDataLiveScore,
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

  it('uses regular-time score for penalty shootout matches', () => {
    const match = createMatch({
      duration: 'PENALTY_SHOOTOUT',
      fullTime: { home: 6, away: 5 },
      regularTime: { home: 1, away: 1 },
      penalties: { home: 5, away: 4 },
    })

    expect(getFootballDataResult(match)).toEqual({ home: 1, away: 1 })
  })

  it('does not use extra-time score when regular-time score is missing', () => {
    const match = createMatch({
      duration: 'EXTRA_TIME',
      fullTime: { home: 2, away: 1 },
    })

    expect(getFootballDataResult(match)).toBeNull()
  })

  it('falls back to full-time score for regular finished matches', () => {
    const match = createMatch({
      duration: 'REGULAR',
      fullTime: { home: 2, away: 1 },
    })

    expect(getFootballDataResult(match)).toEqual({ home: 2, away: 1 })
  })

  it('reads live score from provider fields when present', () => {
    const match = createMatch(
      {
        duration: 'REGULAR',
        fullTime: { home: 2, away: 1 },
      },
      { status: 'IN_PLAY' },
    )

    expect(getFootballDataLiveScore(match)).toEqual({ home: 2, away: 1 })
  })
})

function createMatch(
  score: FootballDataMatch['score'],
  overrides: Partial<FootballDataMatch> = {},
): FootballDataMatch {
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
    ...overrides,
  }
}
