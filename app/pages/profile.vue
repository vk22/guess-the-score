<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Профиль — Guess the Score' })

const { data } = await useFetch('/api/auth/me')
</script>

<template>
  <section class="mx-auto max-w-4xl px-6 py-14">
    <p class="text-sm font-semibold uppercase tracking-widest text-emerald-400">
      Личный кабинет
    </p>
    <h1 class="mt-3 text-4xl font-black">
      {{ data?.user.displayName }}
    </h1>
    <p class="mt-2 text-slate-400">{{ data?.user.email }}</p>

    <div class="mt-10 grid gap-5 sm:grid-cols-2">
      <article class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <strong class="text-4xl text-emerald-400">{{ data?.user.totalPoints ?? 0 }}</strong>
        <p class="mt-2 text-slate-400">Набрано очков</p>
      </article>
      <article class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <strong class="text-4xl text-sky-300">{{ data?.user._count.predictions ?? 0 }}</strong>
        <p class="mt-2 text-slate-400">Сделано прогнозов</p>
      </article>
    </div>
  </section>
</template>
