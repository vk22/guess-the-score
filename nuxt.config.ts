// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-auth-utils',
  ],
  runtimeConfig: {
    footballApiKey: '',
    footballApiBaseUrl: 'https://v3.football.api-sports.io',
    footballLeagues: '1:2026,2:2025,39:2025,78:2025,135:2025,140:2025',
    footballDataApiKey: '',
    footballDataBaseUrl: 'https://api.football-data.org/v4',
    footballDataCompetition: 'WC',
    footballDataStartDate: '2026-06-11',
    footballSyncFutureDays: 45,
    sessionPassword: '',
    syncSecret: '',
    public: {
      appName: 'Guess the Score',
    },
  },
  typescript: {
    typeCheck: true,
  },
})
