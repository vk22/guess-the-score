import { describe, expect, it } from 'vitest'
import { createCompetitionMatchesUrl } from './client'

describe('createCompetitionMatchesUrl', () => {
  it('targets only the configured competition', () => {
    const url = createCompetitionMatchesUrl({
      baseUrl: 'https://api.football-data.org/v4',
      competitionCode: 'WC',
    })

    expect(url.toString()).toBe(
      'https://api.football-data.org/v4/competitions/WC/matches',
    )
  })

  it('rejects an unsafe competition code', () => {
    expect(() => createCompetitionMatchesUrl({
      baseUrl: 'https://api.football-data.org/v4',
      competitionCode: '../matches',
    })).toThrow('Invalid football-data.org competition code')
  })
})
