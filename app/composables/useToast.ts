import { useToast as useVueToastification } from "vue-toastification";

export function useToast() {
  const toast = useVueToastification();

  return {
    success: (message: string, options?: Parameters<typeof toast.success>[1]) => toast.success(message, options),
    error: (message: string, options?: Parameters<typeof toast.error>[1]) => toast.error(message, options),
    info: (message: string, options?: Parameters<typeof toast.info>[1]) => toast.info(message, options),
    warning: (message: string, options?: Parameters<typeof toast.warning>[1]) => toast.warning(message, options),
    default: (message: string, options?: Parameters<typeof toast>[1]) => toast(message, options),
    clear: () => toast.clear(),
  };
}
