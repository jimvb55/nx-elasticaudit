import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Home' }
  },
  {
    path: '/audit/:uuid',
    name: 'AuditDetail',
    component: () => import('../views/AuditDetailView.vue'),
    props: true,
    meta: { title: 'Audit Detail' }
  },
  {
    path: '/search/:query',
    name: 'Search',
    component: () => import('../views/SearchResultsView.vue'),
    props: true,
    meta: { title: 'Search Results' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: '404 Not Found' }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Update document title based on route meta
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | Nuxeo Audit Visualization`;
  next();
});

export default router;
