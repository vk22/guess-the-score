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
      footballApiKey: String(config.footballApiKey),
      footballApiBaseUrl: String(config.footballApiBaseUrl),
      footballLeagues: String(config.footballLeagues),
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
    requests: 'requests' in summary ? summary.requests : summary.leagues,
    synced: summary.synced,
    skipped: 'skipped' in summary ? summary.skipped : 0,
    scored: summary.scored,
    failures: summary.failures,
  }
}
