<script setup lang="ts">
useSeoMeta({
  title: 'Guess the Score — футбольные прогнозы',
  description: 'Прогнозируйте Guess the Score матчей и соревнуйтесь с друзьями.',
})
</script>

<template>
  <section class="mx-auto max-w-6xl px-6 py-20 sm:py-28">
    <div class="max-w-3xl">
      <p class="mb-4 font-semibold uppercase tracking-[0.2em] text-emerald-400">
        Футбольные прогнозы 
      </p>
      <h1 class="text-5xl font-black leading-tight sm:text-7xl">
        Угадывай счет.<br>
        Поднимайся в рейтинге.
      </h1>
      <p class="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
        Выбирай матчи из календаря, оставляй прогноз до стартового свистка
        и получай 3 очка за точный счет или 1 очко за правильный исход.
      </p>
      <div class="mt-10 flex flex-wrap gap-4">
        <NuxtLink
          to="/matches"
          class="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-300"
        >
          Смотреть матчи
        </NuxtLink>
        <NuxtLink
          to="/leaderboard"
          class="rounded-xl border border-white/15 px-6 py-3 font-bold transition hover:bg-white/10"
        >
          Открыть рейтинг
        </NuxtLink>
      </div>
    </div>

    <div class="mt-20 grid gap-5 md:grid-cols-3">
      <article class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <strong class="text-3xl text-emerald-400">3</strong>
        <h2 class="mt-4 text-xl font-bold">Точный счет</h2>
        <p class="mt-2 text-slate-400">Полностью совпал итог матча.</p>
      </article>
      <article class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <strong class="text-3xl text-amber-300">1</strong>
        <h2 class="mt-4 text-xl font-bold">Верный исход</h2>
        <p class="mt-2 text-slate-400">Угадана победа команды или ничья.</p>
      </article>
      <article class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <strong class="text-3xl text-sky-300">∞</strong>
        <h2 class="mt-4 text-xl font-bold">Общий рейтинг</h2>
        <p class="mt-2 text-slate-400">Все заработанные очки идут в зачет.</p>
      </article>
    </div>
  </section>
</template>
