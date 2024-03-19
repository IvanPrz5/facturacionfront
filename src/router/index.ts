// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layout/Layout.vue'),
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
      },
      {
        path: 'facturacion',
        name: 'Facturacion',
        component: () => import('@/views/Facturacion/Facturacion.vue'),
      },
      {
        path: 'empresas',
        name: 'Empresas',
        component: () => import('@/views/Empresas/Empresas.vue')
      },
      {
        path: 'facturas',
        name: 'Facturas',
        component: () => import('@/views/Facturas/Facturas.vue')
      },
      {
        path: 'usuarios',
        name: 'Usuarios',
        component: () => import('@/views/Usuarios/Usuarios.vue')
      }
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register/Register.vue')
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  if(to.matched.some((record) => record.meta.requiresAuth)){
    if(localStorage.getItem("token") != undefined){
      next();
    }else{
      next({ path: '/login' })
    }
  }else{
    next();
  }
})

export default router
