import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import TOS from "../pages/TermsOfService.vue";
import PrivacyPolicy from "../pages/PrivacyPolicy.vue";
import PasswordReset from "../pages/auth/PasswordReset.vue";
import ResetConfirm from "../pages/auth/ResetConfirm.vue";
import Coaching from "../pages/Coaching.vue";
import DashboardView from "../components/coaching/DashboardView.vue";
import ClientsView from "../components/coaching/ClientsView.vue";
import NutritionView from "../components/coaching/NutritionView.vue";
import WorkoutView from "../components/coaching/WorkoutView.vue";
import ClientProfile from "../components/coaching/ClientProfile.vue";
import LoginView from "../components/LoginView.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
  },
  {
    path: "/coaching",
    component: Coaching,
    children: [
      {
        path: "",
        name: "clients",
        component: ClientsView,
      },
      {
        path: "client/:id",
        name: "clientProfile",
        component: ClientProfile,
      },
    ],
  },
  {
    path: "/terms-of-service",
    name: "TermsOfService",
    component: TOS,
  },
  {
    path: "/privacy-policy",
    name: "PrivacyPolicy",
    component: PrivacyPolicy,
  },
  {
    path: "/auth/password-reset",
    name: "PasswordReset",
    component: PasswordReset,
  },
  {
    path: "/auth/reset-confirm",
    name: "ResetConfirm",
    component: ResetConfirm,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach((to, from) => {
  window.scrollTo(0, 0);
});

export default router;
