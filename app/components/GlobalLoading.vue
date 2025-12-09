<script setup lang="ts">
import { useGlobalStore } from "~/store/globalStore";

const { isLoading, loadingMessage } = storeToRefs(useGlobalStore());
const { isNullOrEmpty } = useUtils();
</script>

<template>
  <v-overlay
    :model-value="isLoading"
    class="global-loading-overlay"
    persistent
    z-index="9999"
  >
    <div class="loading-card">
      <div class="loading-container">
        <div class="spinner">
          <div class="spinner-ring" />
          <div class="spinner-ring" />
          <div class="spinner-ring" />
        </div>
        <p v-if="!isNullOrEmpty(loadingMessage)" class="loading-text">
          {{ loadingMessage }}
        </p>
      </div>
    </div>
  </v-overlay>
</template>

<style lang="scss" scoped>
.global-loading-overlay {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-card {
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  padding: 3rem 4rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-width: 300px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.spinner {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-top-color: rgb(var(--v-theme-primary));
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;

  &:nth-child(2) {
    width: 70%;
    height: 70%;
    top: 15%;
    left: 15%;
    border-top-color: rgb(var(--v-theme-secondary));
    animation-delay: -0.5s;
    animation-duration: 1.2s;
  }

  &:nth-child(3) {
    width: 40%;
    height: 40%;
    top: 30%;
    left: 30%;
    border-top-color: rgb(var(--v-theme-accent));
    animation-delay: -1s;
    animation-duration: 0.9s;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.25rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  text-align: center;
  margin: 0;
  letter-spacing: 0.5px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
