<script setup lang="ts">
useSeoMeta({
  title: 'Guess the Score — футбольные прогнозы',
  description: 'Прогнозируйте Guess the Score матчей и соревнуйтесь с друзьями.',
})
</script>

<template>
  <section class="home-page min-h-[calc(100vh-73px)]">
    <div class="home-page__overlay">
      <video
        class="home-page__video"
        src="/video.mp4"
        aria-hidden="true"
        autoplay
        muted
        loop
        playsinline
      />

      <div class="home-page__shade" aria-hidden="true" />

      <div class="home-page__content mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl flex-col justify-center gap-24 px-6 py-10 sm:py-14">
        <div class="max-w-3xl">
          <p class="mb-4 font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Пацанские прогнозы
          </p>
          <h1 class="text-5xl font-black leading-tight sm:text-7xl">
            Угадавай счет.<br>
            Или готовься отжиматься.
          </h1>
          <p class="mt-8 max-w-2xl text-lg leading-8 text-slate-100">
Победитель получает славу и признание. Проигравший - 100 отжиманий, насмешки и забвение.
          </p>
          <!-- <p class="mt-8 max-w-2xl text-lg leading-8 text-slate-100">
            Выбирай матчи из календаря, оставляй прогноз до стартового свистка
            и получай 3 очка за точный счет или 1 очко за правильный исход. 
            <br>Проигравший отжимается 100 раз.
          </p> -->
          <div class="mt-10 flex flex-wrap gap-4">
            <NuxtLink
              to="/matches"
              class="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              Смотреть матчи
            </NuxtLink>
            <NuxtLink
              to="/leaderboard"
              class="rounded-xl border border-white/15 bg-white/10 px-6 py-3 font-bold backdrop-blur transition hover:bg-white/20"
            >
              Открыть рейтинг
            </NuxtLink>
          </div>
        </div>

        <div class="grid gap-5 md:grid-cols-3">
          <article class="rounded-2xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur-sm">
            <strong class="text-3xl text-emerald-400">3</strong>
            <h2 class="mt-4 text-xl font-bold">Точный счет</h2>
            <p class="mt-2 text-slate-300">Полностью совпал итог матча.</p>
          </article>
          <article class="rounded-2xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur-sm">
            <strong class="text-3xl text-amber-300">1</strong>
            <h2 class="mt-4 text-xl font-bold">Верный исход</h2>
            <p class="mt-2 text-slate-300">Угадана победа команды или ничья.</p>
          </article>
          <article class="rounded-2xl border border-white/10 bg-slate-950/50 p-6 backdrop-blur-sm">
            <strong class="text-3xl text-sky-300">∞</strong>
            <h2 class="mt-4 text-xl font-bold">Общий рейтинг</h2>
            <p class="mt-2 text-slate-300">Все заработанные очки идут в зачет.</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-page {
  position: relative;
  overflow: hidden;
}

.home-page__overlay {
  position: relative;
  min-height: inherit;
}

.home-page__video {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: center top;
}

.home-page__shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(2, 6, 23, 0.28) 0%, rgba(2, 6, 23, 0.68) 55%, rgba(2, 6, 23, 0.9) 100%);
}

.home-page__content {
  position: relative;
  z-index: 1;
}

.home-page :deep(.router-link-active) {
  color: inherit;
}

.home-page :deep(.router-link-exact-active) {
  color: inherit;
}
</style>
