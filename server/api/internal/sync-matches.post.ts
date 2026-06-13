import { timingSafeEqual } from 'node:crypto'
import { executeSyncRun } from '../../services/execute-sync-run'

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

  const result = await executeSyncRun({ source: 'github-actions' })

  if (result.skipped) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Sync already running',
    })
  }

  return result.summary
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
