import { timingSafeEqual } from 'node:crypto'
import { runConfiguredSync } from '../../services/run-configured-sync'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const syncSecret = String(config.syncSecret ?? '')

  if (
    !syncSecret
    || !safeEqual(getHeader(event, 'x-sync-secret'), syncSecret)
  ) {
    throw createError({
      statusCode: 401,
      message: 'Invalid sync secret',
    })
  }

  return runConfiguredSync({
    footballApiKey: String(config.footballApiKey),
    footballApiBaseUrl: String(config.footballApiBaseUrl),
    footballLeagues: String(config.footballLeagues),
    footballDataApiKey: String(config.footballDataApiKey),
    footballDataBaseUrl: String(config.footballDataBaseUrl),
    footballDataCompetition: String(config.footballDataCompetition),
    footballDataStartDate: String(config.footballDataStartDate),
    footballSyncFutureDays: Number(config.footballSyncFutureDays),
  })
})

function safeEqual(actual: string | undefined, expected: string) {
  if (!actual) {
    return false
  }

  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)

  return actualBuffer.length === expectedBuffer.length
    && timingSafeEqual(actualBuffer, expectedBuffer)
}
