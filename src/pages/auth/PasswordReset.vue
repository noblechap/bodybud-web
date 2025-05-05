<template>
  <div class="password-reset-page">
    <div class="logo">
      <h1>BodyBud</h1>
    </div>

    <h2>Reset Password</h2>
    <form @submit.prevent="handleSubmit">
      <input
        type="email"
        v-model="email"
        placeholder="Your account email"
        required
      />
      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? "Sending..." : "Send Reset Link" }}
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: "PasswordReset",
  data() {
    return {
      email: "",
      isSubmitting: false,
    };
  },
  methods: {
    async handleSubmit() {
      this.isSubmitting = true;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/password-reset/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: this.email }),
          },
        );

        if (response.ok) {
          alert("Check your email for reset instructions");
          this.email = ""; // Clear the form
        } else {
          const error = await response.json();
          alert(error.detail || "Request failed. Please try again.");
        }
      } catch (err) {
        console.log(err);
        alert("Network error. Please check your connection.");
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

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
