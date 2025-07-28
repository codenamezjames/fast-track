const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/app',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/app/calories',
      },
      {
        path: 'calories',
        name: 'calories',
        component: () => import('../pages/CaloriesPage.vue'),
      },
      {
        path: 'fasting',
        name: 'fasting',
        component: () => import('../pages/FastingPage.vue'),
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('../pages/AnalyticsPage.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../pages/SettingsPage.vue'),
      },
    ],
  },
  {
    path: '/calories',
    redirect: '/app/calories',
  },
  {
    path: '/fasting',
    redirect: '/app/fasting',
  },
  {
    path: '/analytics',
    redirect: '/app/analytics',
  },
  {
    path: '/settings',
    redirect: '/app/settings',
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue'),
  },
]

export default routes
