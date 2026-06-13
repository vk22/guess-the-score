import { describe, expect, it } from 'vitest'
import { getPredictionResult, mapFixtureStatus } from './mapper'
import type { ApiFootballFixture } from './schema'

describe('API-Football mapper', () => {
  it.each([
    ['NS', 'SCHEDULED'],
    ['1H', 'LIVE'],
    ['FT', 'FINISHED'],
    ['PST', 'POSTPONED'],
    ['CANC', 'CANCELLED'],
  ] as const)('maps %s to %s', (providerStatus, status) => {
    expect(mapFixtureStatus(providerStatus)).toBe(status)
  })

  it('uses the regulation full-time score for cup matches', () => {
    const fixture = {
      fixture: {
        id: 1,
        date: '2026-06-13T18:00:00+00:00',
        status: { short: 'PEN' },
      },
      league: { id: 1, name: 'World Cup', season: 2026 },
      teams: {
        home: { id: 1, name: 'Home' },
        away: { id: 2, name: 'Away' },
      },
      goals: { home: 2, away: 1 },
      score: {
        fulltime: { home: 1, away: 1 },
      },
    } satisfies ApiFootballFixture

    expect(getPredictionResult(fixture)).toEqual({ home: 1, away: 1 })
  })
})
