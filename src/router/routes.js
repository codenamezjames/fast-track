const routes = [
  {
    path: '/',
    redirect: '/calories'
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: 'calories', 
        component: () => import('pages/CaloriesPage.vue')
      },
      { 
        path: 'fasting', 
        component: () => import('pages/FastingPage.vue')
      },
      { 
        path: 'analytics', 
        component: () => import('pages/AnalyticsPage.vue')
      },
      { 
        path: 'settings', 
        component: () => import('pages/SettingsPage.vue')
      },
      // Backwards compatibility
      { 
        path: 'dashboard', 
        redirect: '/calories'
      }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
