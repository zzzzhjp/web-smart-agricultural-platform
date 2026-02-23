import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('@views/HomeView.vue')
        },
        {
            path: '/detail/:id',
            name: 'detail',
            component: () => import('@views/DetailView.vue')
        }
    ]
})

export default router