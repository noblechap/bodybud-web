<template>
    <div class="password-reset-confirm-page">
      <div class="logo">
        <h1>BodyBud</h1>
      </div>
      
      <h2>Set New Password</h2>
      <form @submit.prevent="handleSubmit">
        <input 
          type="password" 
          v-model="newPassword" 
          placeholder="New password" 
          required 
          minlength="8"
        >
        <input 
          type="password" 
          v-model="confirmPassword" 
          placeholder="Confirm password" 
          required 
          minlength="8"
        >
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Updating...' : 'Update Password' }}
        </button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PasswordResetConfirm',
    data() {
      return {
        newPassword: '',
        confirmPassword: '',
        error: '',
        isSubmitting: false,
        uid: null,
        token: null
      }
    },
    created() {
      // Extract token and uid from URL hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      this.uid = params.get('uid');
      this.token = params.get('token');
  
      // Validate parameters
      if (!this.uid || !this.token) {
        this.error = 'Invalid reset link. Please request a new one.';
        this.isSubmitting = true; // This will disable the button
      }
    },
    methods: {
      async handleSubmit() {
        // Validate passwords match
        if (this.newPassword !== this.confirmPassword) {
          this.error = "Passwords don't match";
          return;
        }
        
        // Additional password strength check
        if (this.newPassword.length < 8) {
          this.error = "Password must be at least 8 characters";
          return;
        }
        
        this.error = '';
        this.isSubmitting = true;
        
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/password-reset-confirm/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: this.uid,
              token: this.token,
              new_password: this.newPassword
            })
          });
          
          if (response.ok) {
            alert('Password updated successfully! You can now login with your new password.');
            window.location.href = 'https://bodybud.app/auth/reset-request/';
          } else {
            const error = await response.json();
            alert(error.detail || 'Password reset failed. The link may have expired.');
          }
        } catch (err) {
          alert('Network error. Please check your connection.');
        } finally {
          this.isSubmitting = false;
        }
      }
    }
  }
  </script>
  
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