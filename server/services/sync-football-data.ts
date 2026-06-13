import type { FootballDataMatch } from '../integrations/football-data/schema'
import { fetchFootballDataMatches } from '../integrations/football-data/client'
import {
  getFootballDataResult,
  mapFootballDataStatus,
} from '../integrations/football-data/mapper'
import { scoreFinishedMatch } from './score-finished-match'

type SyncFootballDataOptions = {
  apiKey: string
  baseUrl: string
  competitionCode: string
  startDate: string
  futureDays: number
}

type AssignedFootballDataMatch = FootballDataMatch & {
  homeTeam: FootballDataMatch['homeTeam'] & {
    id: number
    name: string
  }
  awayTeam: FootballDataMatch['awayTeam'] & {
    id: number
    name: string
  }
}

export async function syncFootballData(options: SyncFootballDataOptions) {
  const now = new Date()
  const from = options.startDate
  const to = formatDate(addDays(now, options.futureDays))
  const matchesById = new Map<number, FootballDataMatch>()
  const windows = createDateWindows(from, to)

  for (const window of windows) {
    const matches = await fetchFootballDataMatches({
      apiKey: options.apiKey,
      baseUrl: options.baseUrl,
      competitionCode: options.competitionCode,
      from: window.from,
      to: window.to,
    })

    for (const match of matches) {
      matchesById.set(match.id, match)
    }
  }

  let scored = 0
  let synced = 0
  let skipped = 0

  for (const providerMatch of matchesById.values()) {
    if (!hasAssignedTeams(providerMatch)) {
      skipped += 1
      continue
    }

    const match = await upsertFootballDataMatch(providerMatch)
    synced += 1

    if (
      match.status === 'FINISHED'
      && match.homeScore !== null
      && match.awayScore !== null
    ) {
      const result = await scoreFinishedMatch(match.id)
      scored += result.processed
    }
  }

  return {
    provider: 'football-data.org',
    competition: options.competitionCode,
    from,
    to,
    requests: windows.length,
    synced,
    skipped,
    scored,
    failures: [],
  }
}

export function createDateWindows(from: string, to: string) {
  const end = parseDate(to)
  let cursor = parseDate(from)
  const windows: Array<{ from: string, to: string }> = []

  if (cursor > end) {
    throw new Error('Sync start date must not be after end date')
  }

  while (cursor <= end) {
    const windowEnd = new Date(
      Math.min(addDays(cursor, 9).getTime(), end.getTime()),
    )

    windows.push({
      from: formatDate(cursor),
      to: formatDate(windowEnd),
    })
    cursor = addDays(windowEnd, 1)
  }

  return windows
}

async function upsertFootballDataMatch(providerMatch: AssignedFootballDataMatch) {
  const status = mapFootballDataStatus(providerMatch.status)
  const result = getFootballDataResult(providerMatch)
  const syncedAt = new Date()
  const season = Number(providerMatch.season.startDate.slice(0, 4))

  return prisma.$transaction(async (tx) => {
    const competition = await tx.competition.upsert({
      where: {
        providerId_season: {
          providerId: providerMatch.competition.id,
          season,
        },
      },
      create: {
        providerId: providerMatch.competition.id,
        season,
        name: providerMatch.competition.name,
        country: providerMatch.area.name,
        logoUrl: providerMatch.competition.emblem,
      },
      update: {
        name: providerMatch.competition.name,
        country: providerMatch.area.name,
        logoUrl: providerMatch.competition.emblem,
      },
    })

    const [homeTeam, awayTeam] = await Promise.all([
      upsertTeam(tx, providerMatch.homeTeam),
      upsertTeam(tx, providerMatch.awayTeam),
    ])

    return tx.match.upsert({
      where: { providerId: providerMatch.id },
      create: {
        providerId: providerMatch.id,
        competitionId: competition.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        startsAt: new Date(providerMatch.utcDate),
        status,
        homeScore: result?.home,
        awayScore: result?.away,
        finishedAt: status === 'FINISHED' ? syncedAt : null,
        lastSyncedAt: syncedAt,
      },
      update: {
        competitionId: competition.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        startsAt: new Date(providerMatch.utcDate),
        status,
        homeScore: result?.home,
        awayScore: result?.away,
        finishedAt: status === 'FINISHED' ? syncedAt : null,
        lastSyncedAt: syncedAt,
      },
    })
  })
}

function upsertTeam(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  team: AssignedFootballDataMatch['homeTeam'],
) {
  return tx.team.upsert({
    where: { providerId: team.id },
    create: {
      providerId: team.id,
      name: team.name,
      shortName: team.shortName,
      logoUrl: team.crest,
    },
    update: {
      name: team.name,
      shortName: team.shortName,
      logoUrl: team.crest,
    },
  })
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

export function hasAssignedTeams(
  match: FootballDataMatch,
): match is AssignedFootballDataMatch {
  return (
    match.homeTeam.id !== null
    && match.homeTeam.name !== null
    && match.awayTeam.id !== null
    && match.awayTeam.name !== null
  )
}
