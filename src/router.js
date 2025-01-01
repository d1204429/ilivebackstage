import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('./views/Login.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('./views/Register.vue')
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('./views/Layout.vue'),
        redirect: '/home',  // 將儀表板重導向到首頁
        children: [
            {
                path: '/home',
                name: 'Home',
                component: () => import('./views/Home.vue')
            },
            { 
                path: '/account-manager', 
                name: 'AccountManager', 
                component: () => import('./views/AccountManager.vue') 
            },
            {
                path: '/adminroles',
                name: 'AdminRoles',
                component: () => import('./views/AdminRoles.vue')
            },
            {
                path: '/categories',
                name: 'Categories',
                component: () => import('./views/Categories.vue')
            },
            {
                path: '/product',
                name: 'Product',
                component: () => import('./views/Product.vue')
            },
            // 其他子路由...
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守衛
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    // 允許訪問登入和註冊頁面
    if (to.path === '/login' || to.path === '/register') {
        next()
    } else if (!token) {
        next('/login')
    } else {
        next()
    }
})

export default router