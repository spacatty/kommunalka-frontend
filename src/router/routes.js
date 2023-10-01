
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Login.vue'), name: 'login' },
      { path: 'register', component: () => import('pages/Register.vue'), name: 'register' }
    ]
  },
  {
    path: '/dash/',
    component: () => import('layouts/DashLayout.vue'),
    children: [
      { path: 'tasks', component: () => import('pages/dashboard/Tasks.vue'), name: 'dash_tasks' },
      { path: 'homes', component: () => import('pages/dashboard/Homes.vue'), name: 'dash_homes' },
      { path: 'settings', component: () => import('pages/dashboard/Settings.vue'), name: 'dash_settings' }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
