import { z } from 'zod'

const scoreSchema = z.object({
  home: z.number().nullable(),
  away: z.number().nullable(),
})

export const footballDataResponseSchema = z.object({
  matches: z.array(z.object({
    id: z.number().int(),
    utcDate: z.string().datetime(),
    status: z.string(),
    area: z.object({
      name: z.string(),
    }),
    competition: z.object({
      id: z.number().int(),
      name: z.string(),
      emblem: z.string().url().nullable().optional(),
    }),
    season: z.object({
      startDate: z.string(),
    }),
    homeTeam: z.object({
      id: z.number().int().nullable(),
      name: z.string().nullable(),
      shortName: z.string().nullable().optional(),
      crest: z.string().url().nullable().optional(),
    }),
    awayTeam: z.object({
      id: z.number().int().nullable(),
      name: z.string().nullable(),
      shortName: z.string().nullable().optional(),
      crest: z.string().url().nullable().optional(),
    }),
    score: z.object({
      duration: z.string(),
      fullTime: scoreSchema,
      regularTime: scoreSchema.optional(),
      penalties: scoreSchema.optional(),
    }),
  })),
})

export type FootballDataMatch = z.infer<
  typeof footballDataResponseSchema
>['matches'][number]
