import { defineStore } from "pinia";
import { computed, ref } from "vue";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<AuthUser | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value);

  // Actions
  function setTokens(access: string, refresh: string) {
    accessToken.value = access;
    refreshToken.value = refresh;
  }

  function setUser(newUser: AuthUser) {
    user.value = newUser;
  }

  function clearAuth() {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    setTokens,
    setUser,
    clearAuth,
  };
}, {
  persist: {
    storage: localStorage
  },
});
