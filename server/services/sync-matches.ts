import type { ApiFootballFixture } from '../integrations/api-football/schema'
import {
  fetchFixtures,
  parseLeagueSeasons,
} from '../integrations/api-football/client'
import {
  getPredictionResult,
  mapFixtureStatus,
} from '../integrations/api-football/mapper'
import { scoreFinishedMatch } from './score-finished-match'

type SyncMatchesOptions = {
  apiKey: string
  baseUrl: string
  leagues: string
  pastDays: number
  futureDays: number
}

export async function syncMatches(options: SyncMatchesOptions) {
  const now = new Date()
  const from = formatDate(addDays(now, -options.pastDays))
  const to = formatDate(addDays(now, options.futureDays))
  const leagues = parseLeagueSeasons(options.leagues)
  let synced = 0
  let scored = 0
  const failures: Array<{
    leagueId: number
    season: number
    message: string
  }> = []

  for (const league of leagues) {
    try {
      const fixtures = await fetchFixtures({
        apiKey: options.apiKey,
        baseUrl: options.baseUrl,
        leagueId: league.leagueId,
        season: league.season,
        from,
        to,
      })

      for (const fixture of fixtures) {
        const match = await upsertFixture(fixture)
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
    }
    catch (error) {
      failures.push({
        ...league,
        message: error instanceof Error ? error.message : 'Unknown sync error',
      })
    }
  }

  return {
    from,
    to,
    leagues: leagues.length,
    synced,
    scored,
    failures,
  }
}

async function upsertFixture(fixture: ApiFootballFixture) {
  const status = mapFixtureStatus(fixture.fixture.status.short)
  const result = getPredictionResult(fixture)
  const syncedAt = new Date()

  return prisma.$transaction(async (tx) => {
    const competition = await tx.competition.upsert({
      where: {
        providerId_season: {
          providerId: fixture.league.id,
          season: fixture.league.season,
        },
      },
      create: {
        providerId: fixture.league.id,
        season: fixture.league.season,
        name: fixture.league.name,
        country: fixture.league.country,
        logoUrl: fixture.league.logo,
      },
      update: {
        name: fixture.league.name,
        country: fixture.league.country,
        logoUrl: fixture.league.logo,
      },
    })

    const [homeTeam, awayTeam] = await Promise.all([
      tx.team.upsert({
        where: { providerId: fixture.teams.home.id },
        create: {
          providerId: fixture.teams.home.id,
          name: fixture.teams.home.name,
          logoUrl: fixture.teams.home.logo,
        },
        update: {
          name: fixture.teams.home.name,
          logoUrl: fixture.teams.home.logo,
        },
      }),
      tx.team.upsert({
        where: { providerId: fixture.teams.away.id },
        create: {
          providerId: fixture.teams.away.id,
          name: fixture.teams.away.name,
          logoUrl: fixture.teams.away.logo,
        },
        update: {
          name: fixture.teams.away.name,
          logoUrl: fixture.teams.away.logo,
        },
      }),
    ])

    return tx.match.upsert({
      where: { providerId: fixture.fixture.id },
      create: {
        providerId: fixture.fixture.id,
        competitionId: competition.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        startsAt: new Date(fixture.fixture.date),
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
        startsAt: new Date(fixture.fixture.date),
        status,
        homeScore: result?.home,
        awayScore: result?.away,
        finishedAt: status === 'FINISHED' ? syncedAt : null,
        lastSyncedAt: syncedAt,
      },
    })
  })
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}
