import { syncFootballData } from './sync-football-data'

export type ConfiguredSyncResult =
  | Awaited<ReturnType<typeof syncFootballData>>

export async function runConfiguredSync(config: {
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

  throw createError({
    statusCode: 503,
    message: 'Configure NUXT_FOOTBALL_DATA_API_KEY',
  })
}
