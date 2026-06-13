<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()
const loggingOut = ref(false)

async function logout() {
  loggingOut.value = true

  try {
    await clear()
    await navigateTo('/')
  }
  finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <NuxtRouteAnnouncer />
    <header class="border-b border-white/10">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <NuxtLink to="/" class="text-xl font-bold">
          Guess the Score
        </NuxtLink>
        <nav class="flex items-center gap-5 text-sm text-slate-300">
          <NuxtLink to="/matches">Матчи</NuxtLink>
          <NuxtLink to="/leaderboard">Рейтинг</NuxtLink>
          <NuxtLink v-if="loggedIn && user?.isAdmin" to="/admin">
            Админка 
          </NuxtLink>
          <template v-if="loggedIn">
            <NuxtLink to="/profile" class="font-semibold text-white">
              {{ user?.displayName }}
            </NuxtLink>
            <button
              type="button"
              :disabled="loggingOut"
              class="text-slate-400 transition hover:text-white disabled:opacity-60"
              @click="logout"
            >
              Выйти
            </button>
          </template>
          <template v-else>
            <NuxtLink 
            class="rounded-lg bg-emerald-400 px-4 py-2 font-bold text-slate-950"
            to="/login">Войти</NuxtLink>
            <!-- <NuxtLink
              to="/register"
              
            >
              Регистрация
            </NuxtLink> -->
          </template>
        </nav>
      </div>
    </header>

    <main>
      <NuxtPage />
    </main>
  </div>
</template>
