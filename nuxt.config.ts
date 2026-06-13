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
