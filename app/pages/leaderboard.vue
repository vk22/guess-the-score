<script setup lang="ts">
useSeoMeta({ title: 'Рейтинг — Guess the Score' })

const { user } = useUserSession()
const { data: leaderboard, status, error } = await useFetch('/api/leaderboard')

function initials(name: string) {
  return name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
</script>

<template>
  <section class="mx-auto max-w-6xl px-6 py-14">
    <p class="text-sm font-semibold uppercase tracking-widest text-emerald-400">
      Лидеры
    </p>
    <h1 class="mt-3 text-4xl font-black">Общий рейтинг</h1>
    <p class="mt-3 text-slate-400">
      Все участники, набранные очки и результаты прогнозов.
    </p>

    <div v-if="status === 'pending'" class="mt-10 text-slate-400">
      Загружаем рейтинг...
    </div>

    <div v-else-if="error" class="mt-10 rounded-2xl border border-red-400/30 bg-red-400/10 p-8 text-red-200">
      Не удалось загрузить рейтинг.
    </div>

    <div
      v-else-if="!leaderboard?.length"
      class="mt-10 rounded-2xl border border-dashed border-white/15 p-10 text-center text-slate-400"
    >
      Рейтинг появится после регистрации первых участников.
    </div>

    <div v-else class="mt-10 overflow-hidden rounded-2xl border border-white/10">
      <div class="hidden grid-cols-[5rem_1fr_repeat(4,8rem)] gap-4 border-b border-white/10 bg-white/5 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 md:grid">
        <span>Место</span>
        <span>Участник</span>
        <span class="text-center">Очки</span>
        <span class="text-center">Guess the Score</span>
        <span class="text-center">Исход</span>
        <span class="text-center">Прогнозов</span>
      </div>

      <article
        v-for="participant in leaderboard"
        :key="participant.id"
        class="grid gap-4 border-b border-white/10 px-5 py-5 last:border-b-0 md:grid-cols-[5rem_1fr_repeat(4,8rem)] md:items-center md:px-6"
        :class="participant.id === user?.id ? 'bg-emerald-400/10' : 'bg-slate-950/40'"
      >
        <div class="flex items-center justify-between md:block">
          <span class="text-xs uppercase tracking-wider text-slate-500 md:hidden">Место</span>
          <strong
            class="text-xl"
            :class="participant.rank <= 3 ? 'text-amber-300' : 'text-slate-300'"
          >
            #{{ participant.rank }}
          </strong>
        </div>

        <div class="flex items-center gap-3">
          <img
            v-if="participant.avatarUrl"
            :src="participant.avatarUrl"
            :alt="participant.displayName"
            class="h-10 w-10 rounded-full object-cover"
          >
          <span
            v-else
            class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold"
          >
            {{ initials(participant.displayName) }}
          </span>
          <div>
            <p class="font-bold">{{ participant.displayName }}</p>
            <p v-if="participant.id === user?.id" class="text-xs text-emerald-400">
              Это вы
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between md:block md:text-center">
          <span class="text-sm text-slate-500 md:hidden">Очки</span>
          <strong class="text-2xl text-emerald-400">{{ participant.totalPoints }}</strong>
        </div>
        <div class="flex items-center justify-between md:block md:text-center">
          <span class="text-sm text-slate-500 md:hidden">Guess the Score</span>
          <span>{{ participant.exactScores }}</span>
        </div>
        <div class="flex items-center justify-between md:block md:text-center">
          <span class="text-sm text-slate-500 md:hidden">Верный исход</span>
          <span>{{ participant.correctOutcomes }}</span>
        </div>
        <div class="flex items-center justify-between md:block md:text-center">
          <span class="text-sm text-slate-500 md:hidden">Прогнозов</span>
          <span>{{ participant.scoredPredictions }}</span>
        </div>
      </article>
    </div>
  </section>
</template>
