<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12" rounded="lg">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login</v-toolbar-title>
            <img
              src="../assets/logo.png"
              alt="BodyBud logo"
              style="height: 60px"
              class="pr-4"
            />
          </v-toolbar>

          <v-card-text>
            <v-form @submit.prevent="handleLogin" ref="loginForm">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                prepend-icon="mdi-email"
                :rules="emailRules"
                required
                variant="outlined"
                class="mb-4"
              />

              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                prepend-icon="mdi-lock"
                :rules="passwordRules"
                required
                variant="outlined"
                class="mb-2"
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
                :loading="loading"
                :disabled="loading"
              >
                <template v-slot:loader>
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

          <v-snackbar v-model="showError" color="error" timeout="3000">
            {{ error }}
            <template v-slot:actions>
              <v-btn icon="mdi-close" @click="showError = false" />
            </template>
          </v-snackbar>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref(null);
const loginForm = ref(null);
const authStore = useAuthStore();
const router = useRouter();

const emailRules = [
  (v) => !!v || "Email is required",
  (v) => /.+@.+\..+/.test(v) || "Email must be valid",
];

const passwordRules = [
  (v) => !!v || "Password is required",
  (v) => (v && v.length >= 8) || "Password must be at least 8 characters",
];

const showError = computed({
  get: () => !!error.value,
  set: (val) => !val && (error.value = null),
});

const handleLogin = async () => {
  const { valid } = await loginForm.value.validate();
  if (!valid) return;

  try {
    loading.value = true;
    error.value = null;
    await authStore.login(email.value, password.value);
    router.push("/coaching");
  } catch (err) {
    error.value = err.response?.data?.message || err.message || "Login failed";
  } finally {
    loading.value = false;
  }
};
</script>

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
