import { useAuthStore } from "~/store/authStore";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const baseURL = config.public.baseApiUrl;

  const anonymousApi = $fetch.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const authenticatedApi = $fetch.create({
    baseURL,
    async onRequest({ options }) {
      const authStore = useAuthStore();
      if (authStore.accessToken) {
        options.headers.set("Authorization", `Bearer ${authStore.accessToken}`);
      }
      options.headers.set("Content-Type", "application/json");
    },
  });

  const authenticatedApiWrapper = async <T>(url: string, options: Parameters<typeof authenticatedApi>[1] = {}) => {
    try {
      return await authenticatedApi<T>(url, options);
    }
    catch (error: unknown) {
      // eslint-disable-next-line ts/no-explicit-any
      if ((error as any).response?.status === 401) {
        const authStore = useAuthStore();
        if (authStore.refreshToken) {
          try {
            const refreshResponse = await anonymousApi<{ access: string; refresh?: string }>("/auth/refresh/", {
              method: "POST",
              body: { refresh: authStore.refreshToken },
            });

            authStore.setTokens(refreshResponse.access, refreshResponse.refresh || authStore.refreshToken);

            // Retry
            return await authenticatedApi<T>(url, options);
          }
          catch (refreshError) {
            authStore.clearAuth();
            await navigateTo("/login");
            throw refreshError;
          }
        }
      }
      throw error;
    }
  };

  return {
    provide: {
      authenticatedApi: authenticatedApiWrapper,
      anonymousApi,
    },
  };
});
