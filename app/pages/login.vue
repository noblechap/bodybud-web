<script setup lang="ts">
import type { ApiErrorResponse, StandardError } from "~/types/errors";
import { toTypedSchema } from "@vee-validate/zod";
import { useField, useForm } from "vee-validate";
import { useRouter } from "vue-router";
import { z } from "zod";
import { useAuthService } from "~/composables/services/useAuthService";

const { isLoading, showLoading, hideLoading } = useGlobalLoading();
const authService = useAuthService();
const router = useRouter();
const toast = useToast();

onBeforeMount(async () => {
  if (authService.isAuthenticated.value) {
    try {
      await authService.refreshAccessToken();
      router.push("/coaching");
    }
    catch {
      // Token invalid, stay on login page
    }
  }
});

const loginSchema = toTypedSchema(z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
}));

const { handleSubmit } = useForm({
  validationSchema: loginSchema,
  initialValues: {
    email: "",
    password: "",
  },
});

const { value: email, errorMessage: emailError } = useField("email");
const { value: password, errorMessage: passwordError } = useField("password");

const showPassword = ref(false);

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

const handleLogin = handleSubmit(async (_values) => {
  try {
    showLoading("Logging in...");
    await authService.login({
      email: _values.email,
      password: _values.password,
    });
    router.push("/coaching");
  }
  catch (err: unknown) {
    const errorMessage = (err as ApiErrorResponse).response?.data?.message || (err as StandardError).message || "Login failed";
    toast.error(errorMessage);
  }
  finally {
    hideLoading();
  }
});
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col
        cols="12"
        sm="8"
        md="6"
        lg="4"
      >
        <v-card class="elevation-12" rounded="lg">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login</v-toolbar-title>
            <img
              src="/img/logo.png"
              alt="BodyBud logo"
              style="height: 60px"
              class="pr-4"
            >
          </v-toolbar>

          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                prepend-icon="mdi-email"
                :error-messages="emailError"
                required
                variant="outlined"
                class="mb-4"
              />

              <v-text-field
                v-model="password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                prepend-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :error-messages="passwordError"
                required
                variant="outlined"
                class="mb-2"
                @click:append-inner="togglePasswordVisibility"
              />

              <div class="text-right mb-4">
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  @click="router.push('/auth/password-reset')"
                >
                  Forgot Password?
                </v-btn>
              </div>

              <v-btn
                type="submit"
                block
                size="large"
                color="primary"
                :loading="isLoading"
                :disabled="isLoading"
              >
                <template #loader>
                  <v-progress-circular indeterminate size="24" color="white" />
                </template>
                Sign In
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider />

          <v-card-actions class="justify-center pa-4">
            <span class="text-caption text-medium-emphasis mr-1">
              Don't have an account?
            </span>
            <v-btn
              variant="text"
              color="primary"
              size="small"
              @click="router.push('/')"
            >
              Sign Up on the App
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.fill-height {
  min-height: 80vh;
}

.v-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.v-card {
  overflow: hidden;
}

.v-toolbar {
  background: linear-gradient(to right, #4b6cb7, #182848);
}

.v-btn--block {
  letter-spacing: 0.5px;
  font-weight: 600;
}
</style>
