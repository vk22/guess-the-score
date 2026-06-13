import { z } from 'zod'

const email = z
  .string()
  .trim()
  .email('Введите корректный email')
  .max(254, 'Email слишком длинный')
  .transform(value => value.toLowerCase())

const username = z
  .string()
  .trim()
  .min(2, 'Username должен содержать минимум 2 символа')
  .max(40, 'Username должен содержать не более 40 символов')
  .transform(value => value.toLowerCase())

const password = z
  .string()
  .min(8, 'Пароль должен содержать минимум 8 символов')
  .max(128, 'Пароль слишком длинный')

export const registerSchema = z.object({
  email,
  username,
  password,
})

export const loginSchema = z.object({
  username,
  password,
})

export type RegisterInput = z.input<typeof registerSchema>
export type LoginInput = z.input<typeof loginSchema>
