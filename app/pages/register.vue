<script setup lang="ts">
import type { FetchError } from 'ofetch'
import type { RegisterInput } from '#shared/schemas/auth'

definePageMeta({ middleware: 'guest' })
useSeoMeta({ title: 'Регистрация — Guess the Score' })

const { fetch: fetchSession } = useUserSession()
const form = reactive<RegisterInput>({
  displayName: '',
  email: '',
  password: '',
})
const errorMessage = ref('')
const submitting = ref(false)

async function submit() {
  errorMessage.value = ''
  submitting.value = true

  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: form,
    })
    await fetchSession()
    await navigateTo('/profile')
  }
  catch (error) {
    const fetchError = error as FetchError<{
      message?: string
      statusMessage?: string
      data?: {
        issues?: Array<{ message: string }>
      }
    }>
    errorMessage.value = fetchError.data?.data?.issues?.[0]?.message
      ?? fetchError.data?.message
      ?? fetchError.data?.statusMessage
      ?? 'Не удалось создать аккаунт'
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="mx-auto max-w-md px-6 py-14">
    <p class="text-sm font-semibold uppercase tracking-widest text-emerald-400">
      Новый участник
    </p>
    <h1 class="mt-3 text-4xl font-black">Регистрация</h1>

    <form class="mt-10 space-y-5" @submit.prevent="submit">
      <AuthFormError v-if="errorMessage" :message="errorMessage" />

      <label class="block">
        <span class="mb-2 block text-sm font-medium text-slate-300">Имя</span>
        <input
          v-model="form.displayName"
          name="displayName"
          autocomplete="name"
          required
          minlength="2"
          maxlength="40"
          class="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none transition focus:border-emerald-400"
        >
      </label>

      <label class="block">
        <span class="mb-2 block text-sm font-medium text-slate-300">Email</span>
        <input
          v-model="form.email"
          name="email"
          type="email"
          autocomplete="email"
          required
          class="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none transition focus:border-emerald-400"
        >
      </label>

      <label class="block">
        <span class="mb-2 block text-sm font-medium text-slate-300">Пароль</span>
        <input
          v-model="form.password"
          name="password"
          type="password"
          autocomplete="new-password"
          required
          minlength="8"
          maxlength="128"
          class="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none transition focus:border-emerald-400"
        >
      </label>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ submitting ? 'Создаем аккаунт...' : 'Зарегистрироваться' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-400">
      Уже есть аккаунт?
      <NuxtLink to="/login" class="font-semibold text-emerald-400">Войти</NuxtLink>
    </p>
  </section>
</template>
