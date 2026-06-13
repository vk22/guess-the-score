export default defineNuxtRouteMiddleware(async () => {
  const session = useUserSession()

  if (!session.ready.value) {
    await session.fetch()
  }

  if (!session.loggedIn.value) {
    return navigateTo('/login')
  }

  if (!session.user.value?.isAdmin) {
    return navigateTo('/profile')
  }
})
