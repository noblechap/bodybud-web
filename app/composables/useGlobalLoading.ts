import { useGlobalStore } from "~/store/globalStore";

/**
 * Composable pour gérer l'état de chargement global de l'application
 * Permet d'afficher un overlay de chargement depuis n'importe quel composant
 */
export function useGlobalLoading() {
  const globalStore = useGlobalStore();

  return {
    isLoading: computed(() => globalStore.isLoading),
    loadingMessage: computed(() => globalStore.loadingMessage),
    showLoading: globalStore.showLoading,
    hideLoading: globalStore.hideLoading,
  };
}
