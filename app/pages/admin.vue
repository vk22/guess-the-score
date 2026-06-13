<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin — Guess the Score' })

const { data: runs, refresh, status } = await useFetch('/api/admin/sync-runs')
const busy = ref(false)
const message = ref('')

async function syncNow() {
  busy.value = true
  message.value = ''

  try {
    const result = await $fetch<{ synced: number, scored: number }>('/api/admin/sync-now', {
      method: 'POST',
    })

    message.value = `Синхронизация завершена: ${result.synced} матчей, ${result.scored} начислений.`
    await refresh()
  }
  catch (error) {
    message.value = error instanceof Error ? error.message : 'Не удалось обновить результаты'
  }
  finally {
    busy.value = false
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Chisinau',
  }).format(new Date(value))
}

function failuresCount(failures: unknown) {
  return Array.isArray(failures) ? failures.length : 0
}
</script>

<template>
  <section class="mx-auto max-w-6xl px-6 py-14">
    <p class="text-sm font-semibold uppercase tracking-widest text-emerald-400">
      Администрирование
    </p>
    <h1 class="mt-3 text-4xl font-black">Обновление результатов</h1>
    <p class="mt-3 max-w-2xl text-slate-400">
      Ручной запуск синхронизации календаря и результатов FIFA World Cup 2026. 
    </p>

    <div class="mt-8 flex flex-wrap items-center gap-4">
      <button
        type="button"
        :disabled="busy"
        class="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
        @click="syncNow"
      >
        {{ busy ? 'Обновляем...' : 'Обновить результаты' }}
      </button>
      <button
        type="button"
        class="rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-white/5"
        @click="() => refresh()"
      >
        Обновить лог
      </button>
    </div>

    <p
      v-if="message"
      class="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
    >
      {{ message }}
    </p>

    <div v-if="status === 'pending'" class="mt-10 text-slate-400">
      Загружаем журнал...
    </div>

    <div v-else class="mt-10 overflow-hidden rounded-2xl border border-white/10">
      <div class="grid grid-cols-[12rem_10rem_10rem_10rem_10rem_1fr] gap-4 border-b border-white/10 bg-white/5 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <span>Время</span>
        <span>Источник</span>
        <span>Статус</span>
        <span>Сыграно</span>
        <span>Начислено</span>
        <span>Ошибки</span>
      </div>

      <div
        v-for="run in runs ?? []"
        :key="run.id"
        class="grid grid-cols-[12rem_10rem_10rem_10rem_10rem_1fr] gap-4 border-b border-white/10 px-6 py-4 last:border-b-0"
      >
        <div>
          <p class="font-medium">{{ formatDateTime(run.startedAt) }}</p>
          <p v-if="run.finishedAt" class="text-sm text-slate-500">
            {{ formatDateTime(run.finishedAt) }}
          </p>
        </div>
        <span>{{ run.source }}{{ run.competition ? ` / ${run.competition}` : '' }}</span>
        <span>{{ run.status }}</span>
        <span>{{ run.synced }}</span>
        <span>{{ run.scored }}</span>
        <span>{{ failuresCount(run.failures) }}</span>
      </div>
    </div>
  </section>
</template>
