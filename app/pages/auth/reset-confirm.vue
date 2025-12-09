<script setup lang="ts">
import { useAuthApi } from "~/composables/api/auth/useAuthApi";

const newPassword = ref("");
const confirmPassword = ref("");
const error = ref("");
const isSubmitting = ref(false);
const uid = ref<string | null>(null);
const token = ref<string | null>(null);
const toast = useToast();
const { passwordResetConfirm } = useAuthApi();
const { showLoading, hideLoading } = useGlobalLoading();

onMounted(() => {
  // Extract token and uid from URL hash
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  uid.value = params.get("uid");
  token.value = params.get("token");

  // Validate parameters
  if (!uid.value || !token.value) {
    error.value = "Invalid reset link. Please request a new one.";
    isSubmitting.value = true; // This will disable the button
  }
});

async function handleSubmit() {
  // Validate passwords match
  if (newPassword.value !== confirmPassword.value) {
    error.value = "Passwords don't match";
    return;
  }

  // Additional password strength check
  if (newPassword.value.length < 8) {
    error.value = "Password must be at least 8 characters";
    return;
  }

  error.value = "";
  isSubmitting.value = true;

  try {
    if (!uid.value || !token.value) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }

    showLoading("Updating password...");
    const response = await passwordResetConfirm(uid.value, token.value, newPassword.value);

    if (response.detail) {
      toast.success(
        "Password updated successfully! You can now login with your new password.",
      );
      window.location.href = "https://bodybud.app/auth/reset-request/";
    }
  }
  catch {
    toast.error("Password reset failed. The link may have expired.");
  }
  finally {
    hideLoading();
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="password-reset-confirm-page">
    <div class="logo">
      <h1>BodyBud</h1>
    </div>

    <h2>Set New Password</h2>
    <form @submit.prevent="handleSubmit">
      <input
        v-model="newPassword"
        type="password"
        placeholder="New password"
        required
        minlength="8"
      >
      <input
        v-model="confirmPassword"
        type="password"
        placeholder="Confirm password"
        required
        minlength="8"
      >
      <p v-if="error" class="error">
        {{ error }}
      </p>
      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? "Updating..." : "Update Password" }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.password-reset-confirm-page {
  font-family: Arial, sans-serif;
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input {
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input:focus {
  outline: none;
  border-color: #0954ec;
}

button {
  background-color: #0954ec;
  color: white;
  border: none;
  cursor: pointer;
  padding: 10px;
  font-size: 16px;
  border-radius: 4px;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}

.error {
  color: red;
  margin: 0;
}
</style>
