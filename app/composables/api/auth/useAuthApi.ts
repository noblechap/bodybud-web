export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  userId: number;
  username: string;
  adminStatus: boolean;
}

export interface RefreshResponse {
  access: string;
  refresh?: string;
}

export function useAuthApi() {
  const { $anonymousApi } = useNuxtApp();

  async function login(credentials: LoginCredentials) {
    return $anonymousApi<LoginResponse>("/login/", {
      method: "POST",
      body: credentials,
    });
  }

  async function refreshToken(token: string) {
    return $anonymousApi<RefreshResponse>("/auth/refresh/", {
      method: "POST",
      body: { refresh: token },
    });
  }

  async function passwordReset(email: string) {
    return $anonymousApi<{ detail: string }>("/password-reset/", {
      method: "POST",
      body: { email },
    });
  }

  async function passwordResetConfirm(uid: string, token: string, newPassword: string) {
    return $anonymousApi<{ detail: string }>("/password-reset-confirm/", {
      method: "POST",
      body: {
        uid,
        token,
        new_password: newPassword,
      },
    });
  }

  return {
    login,
    refreshToken,
    passwordReset,
    passwordResetConfirm,
  };
}
