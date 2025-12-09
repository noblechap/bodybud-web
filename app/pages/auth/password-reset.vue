<script lang="ts" setup>
import { useAuthService } from "~/composables/services/useAuthService";

const email = ref("");
const { isLoading } = useGlobalLoading();
const { passwordReset } = useAuthService();

async function handleSubmit() {
  try {
    await passwordReset(email.value);
    email.value = ""; // Clear the form
  }
  catch {
    // L'erreur est déjà gérée par le service
  }
}
</script>

<template>
  <div class="password-reset-page">
    <div class="logo">
      <h1>BodyBud</h1>
    </div>

    <h2>Reset Password</h2>
    <form @submit.prevent="handleSubmit">
      <input
        v-model="email"
        type="email"
        placeholder="Your account email"
        required
      >
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "Sending..." : "Send Reset Link" }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.password-reset-page {
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
  outline: none;
  transition: border-color 0.3s ease;
}

input,
button {
  padding: 10px;
  font-size: 16px;
}

button {
  background-color: #0954ec;
  color: white;
  border: none;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}
</style>
