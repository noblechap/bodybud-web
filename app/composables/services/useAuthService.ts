import type { LoginCredentials } from "~/composables/api/auth/useAuthApi";
import type { ApiErrorResponse } from "~/types/errors";
import { useAuthApi } from "~/composables/api/auth/useAuthApi";
import { useAuthStore } from "~/store/authStore";

export function useAuthService() {
  const authStore = useAuthStore();
  const { login: apiLogin, refreshToken: apiRefreshToken, passwordReset: apiPasswordReset } = useAuthApi();
  const { showLoading, hideLoading } = useGlobalLoading();
  const toast = useToast();

  const isAuthenticated = computed(() => authStore.isAuthenticated);

  async function login(credentials: LoginCredentials) {
    try {
      const response = await apiLogin(credentials);

      authStore.setTokens(response.access, response.refresh);
      authStore.setUser({
        id: response.userId,
        username: response.username,
        email: credentials.email,
        isAdmin: response.adminStatus,
      });

      return response;
    }
    catch (error) {
      let errorMessage = "Login failed";
      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as ApiErrorResponse;
        errorMessage
          = apiError.response?.data?.detail
            || apiError.response?.data?.message
            || errorMessage;
      }
      throw new Error(errorMessage);
    }
  }

  async function refreshAccessToken() {
    if (!authStore.refreshToken) {
      logout();
      throw new Error("No refresh token available");
    }

    try {
      const response = await apiRefreshToken(authStore.refreshToken);
      // If the API returns a new refresh token, use it, otherwise keep the old one
      authStore.setTokens(response.access, response.refresh || authStore.refreshToken!);
      return response;
    }
    catch (error) {
      logout();
      throw error;
    }
  }

  function logout() {
    authStore.clearAuth();
    navigateTo("/login");
  }

  async function passwordReset(email: string) {
    try {
      showLoading("Sending password reset email...");
      const response = await apiPasswordReset(email);
      toast.success("Check your email for reset instructions");
      return response;
    }
    catch (error) {
      const apiError = error as ApiErrorResponse;
      const errorMessage = apiError.response?.data?.detail
        || apiError.response?.data?.message
        || "Request failed. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
    finally {
      hideLoading();
    }
  }

  return {
    isAuthenticated,
    login,
    logout,
    refreshAccessToken,
    passwordReset,
  };
}
