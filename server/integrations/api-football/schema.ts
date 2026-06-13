import { z } from 'zod'

const scoreSchema = z.object({
  home: z.number().nullable(),
  away: z.number().nullable(),
})

export const apiFootballResponseSchema = z.object({
  errors: z.union([
    z.array(z.unknown()),
    z.record(z.string(), z.unknown()),
  ]),
  results: z.number(),
  response: z.array(z.object({
    fixture: z.object({
      id: z.number().int(),
      date: z.string().datetime({ offset: true }),
      status: z.object({
        short: z.string(),
      }),
    }),
    league: z.object({
      id: z.number().int(),
      name: z.string(),
      country: z.string().nullable().optional(),
      logo: z.string().url().nullable().optional(),
      season: z.number().int(),
    }),
    teams: z.object({
      home: z.object({
        id: z.number().int(),
        name: z.string(),
        logo: z.string().url().nullable().optional(),
      }),
      away: z.object({
        id: z.number().int(),
        name: z.string(),
        logo: z.string().url().nullable().optional(),
      }),
    }),
    goals: scoreSchema,
    score: z.object({
      fulltime: scoreSchema,
    }),
  })),
})

export type ApiFootballFixture = z.infer<
  typeof apiFootballResponseSchema
>['response'][number]
