import { syncMatches } from './sync-matches'
import { syncFootballData } from './sync-football-data'

export type ConfiguredSyncResult =
  | Awaited<ReturnType<typeof syncFootballData>>
  | Awaited<ReturnType<typeof syncMatches>>

export async function runConfiguredSync(config: {
  footballApiKey: string
  footballApiBaseUrl: string
  footballLeagues: string
  footballDataApiKey: string
  footballDataBaseUrl: string
  footballDataCompetition: string
  footballDataStartDate: string
  footballSyncFutureDays: number
}) {
  if (config.footballDataApiKey) {
    return syncFootballData({
      apiKey: config.footballDataApiKey,
      baseUrl: config.footballDataBaseUrl,
      competitionCode: config.footballDataCompetition,
      startDate: config.footballDataStartDate,
      futureDays: config.footballSyncFutureDays,
    })
  }

  if (!config.footballApiKey) {
    throw createError({
      statusCode: 503,
      message: 'Configure NUXT_FOOTBALL_DATA_API_KEY or NUXT_FOOTBALL_API_KEY',
    })
  }

  return syncMatches({
    apiKey: config.footballApiKey,
    baseUrl: config.footballApiBaseUrl,
    leagues: config.footballLeagues,
    pastDays: 2,
    futureDays: config.footballSyncFutureDays,
  })
}
