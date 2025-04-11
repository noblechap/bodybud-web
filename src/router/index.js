import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import TOS from '../pages/TermsOfService.vue'
import PrivacyPolicy from '../pages/PrivacyPolicy.vue'
import PasswordReset from '../pages/auth/PasswordReset.vue'
import ResetConfirm from '../pages/auth/ResetConfirm.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/terms-of-service',
    name: 'TermsOfService',
    component: TOS,
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: PrivacyPolicy,
  },
  {
    path: '/auth/password-reset',
    name: 'PasswordReset',
    component: PasswordReset,
  },
  {
    path: '/auth/reset-confirm',
    name: 'ResetConfirm',
    component: ResetConfirm,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router