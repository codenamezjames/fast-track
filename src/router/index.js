import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from '../stores/auth.js'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Authentication guards
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    
    // Initialize auth on first navigation
    if (!authStore.user && !authStore.isLoading) {
      await authStore.initAuth()
    }
    
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
    
    if (requiresAuth && !authStore.isAuthenticated) {
      // Redirect to login if authentication is required
      next('/login')
    } else if (requiresGuest && authStore.isAuthenticated) {
      // Redirect to dashboard if user is already logged in
      next('/dashboard')
    } else {
      next()
    }
  })

  return Router
})
