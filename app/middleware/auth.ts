export default defineNuxtRouteMiddleware(async (to) => {
  const session = useUserSession()

  if (!session.ready.value) {
    await session.fetch()
  }

  if (!session.loggedIn.value) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    })
  }
})
