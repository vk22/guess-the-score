import { apiFootballResponseSchema } from './schema'

export type LeagueSeason = {
  leagueId: number
  season: number
}

export function parseLeagueSeasons(value: string): LeagueSeason[] {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [leagueIdValue, seasonValue] = item.split(':')
      const leagueId = Number(leagueIdValue)
      const season = Number(seasonValue)

      if (!Number.isInteger(leagueId) || !Number.isInteger(season)) {
        throw new Error(`Invalid league configuration: ${item}`)
      }

      return { leagueId, season }
    })
}

export async function fetchFixtures(options: {
  apiKey: string
  baseUrl: string
  leagueId: number
  season: number
  from: string
  to: string
}) {
  const url = new URL('/fixtures', options.baseUrl)
  url.searchParams.set('league', String(options.leagueId))
  url.searchParams.set('season', String(options.season))
  url.searchParams.set('from', options.from)
  url.searchParams.set('to', options.to)
  url.searchParams.set('timezone', 'UTC')

  const response = await fetch(url, {
    headers: {
      'x-apisports-key': options.apiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`API-Football request failed with status ${response.status}`)
  }

  const payload = apiFootballResponseSchema.parse(await response.json())
  const errors = Array.isArray(payload.errors)
    ? payload.errors
    : Object.values(payload.errors)

  if (errors.length > 0) {
    throw new Error(`API-Football error: ${JSON.stringify(payload.errors)}`)
  }

  return payload.response
}
