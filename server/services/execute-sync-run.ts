import { createSyncRun, failSyncRun, finishSyncRun } from '../utils/sync-run'
import { runConfiguredSync } from './run-configured-sync'

type ExecuteSyncRunInput = {
  source: string
}

let syncInProgress = false

export async function executeSyncRun(input: ExecuteSyncRunInput) {
  if (syncInProgress) {
    return { skipped: true }
  }

  syncInProgress = true

  const config = useRuntimeConfig()
  const tx = prisma
  const run = await createSyncRun(tx, {
    source: input.source,
    competition: String(config.footballDataCompetition ?? 'WC'),
  })

  try {
    const summary = await runConfiguredSync({
      footballDataApiKey: String(config.footballDataApiKey),
      footballDataBaseUrl: String(config.footballDataBaseUrl),
      footballDataCompetition: String(config.footballDataCompetition),
      footballDataStartDate: String(config.footballDataStartDate),
      footballSyncFutureDays: Number(config.footballSyncFutureDays),
    })

    const normalizedSummary = normalizeSyncSummary(summary)

    await finishSyncRun(tx, run.id, normalizedSummary)

    return {
      skipped: false,
      summary: normalizedSummary,
    }
  }
  catch (error) {
    await failSyncRun(tx, run.id, error)
    throw error
  }
  finally {
    syncInProgress = false
  }
}

function normalizeSyncSummary(
  summary: Awaited<ReturnType<typeof runConfiguredSync>>,
) {
  return {
    provider: 'provider' in summary ? summary.provider : 'football-data.org',
    competition: 'competition' in summary ? summary.competition : null,
    from: summary.from,
    to: summary.to,
    requests: summary.requests,
    synced: summary.synced,
    skipped: summary.skipped,
    scored: summary.scored,
    failures: summary.failures,
  }
}
