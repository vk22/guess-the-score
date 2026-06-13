export default defineNuxtRouteMiddleware(async () => {
  const session = useUserSession()

  if (!session.ready.value) {
    await session.fetch()
  }

  if (session.loggedIn.value) {
    return navigateTo('/profile')
  }
})
