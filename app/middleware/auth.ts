import { useAuthService } from "~/composables/services/useAuthService";

export default defineNuxtRouteMiddleware(async () => {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const { isAuthenticated, refreshAccessToken } = useAuthService();

  if (!isAuthenticated) {
    return navigateTo("/login");
  }

  // Validate token validity
  // TODO: Uncomment when refresh token endpoint is stable
  // try {
  //   await refreshAccessToken();
  // }
  // catch {
  //   return navigateTo("/login");
  // }
});
