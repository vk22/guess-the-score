import { footballDataResponseSchema } from './schema'

export async function fetchFootballDataMatches(options: {
  apiKey: string
  baseUrl: string
  competitionCode: string
  from: string
  to: string
}) {
  const url = createCompetitionMatchesUrl(options)
  url.searchParams.set('dateFrom', options.from)
  url.searchParams.set('dateTo', options.to)

  const response = await fetch(url, {
    headers: {
      'X-Auth-Token': options.apiKey,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(
      `football-data.org request failed (${response.status}): ${message}`,
    )
  }

  return footballDataResponseSchema.parse(await response.json()).matches
}

export function createCompetitionMatchesUrl(options: {
  baseUrl: string
  competitionCode: string
}) {
  if (!/^[A-Z0-9]+$/.test(options.competitionCode)) {
    throw new Error('Invalid football-data.org competition code')
  }

  const baseUrl = options.baseUrl.endsWith('/')
    ? options.baseUrl
    : `${options.baseUrl}/`

  return new URL(
    `competitions/${options.competitionCode}/matches`,
    baseUrl,
  )
}
