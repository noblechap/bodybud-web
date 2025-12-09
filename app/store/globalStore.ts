import { defineStore } from "pinia";

export const useGlobalStore = defineStore("globalStore", () => {
  const isLoading = ref<boolean>(false);
  const loadingMessage = ref<string>("Loading...");

  function showLoading(message: string = "Loading...") {
    loadingMessage.value = message;
    isLoading.value = true;
  }

  function hideLoading() {
    isLoading.value = false;
    loadingMessage.value = "";
  }

  return { isLoading, loadingMessage, showLoading, hideLoading };
});
