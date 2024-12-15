import { toast, ToastOptions, TypeOptions } from 'react-toastify';

interface NotificationHook {
  success: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
  info: (message: string) => void;
}

export const useNotification = (): NotificationHook => {
  const defaultOptions: ToastOptions = {
    position: 'bottom-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  const showNotification = (message: string, type: TypeOptions) => {
    switch (type) {
      case 'success':
        toast.success(message, defaultOptions);
        break;
      case 'error':
        toast.error(message, defaultOptions);
        break;
      case 'warn':
        toast.warn(message, defaultOptions);
        break;
      case 'info':
        toast.info(message, defaultOptions);
        break;
      default:
        toast(message, defaultOptions);
    }
  };

  return {
    success: (message: string) => showNotification(message, 'success'),
    error: (message: string) => showNotification(message, 'error'),
    warn: (message: string) => showNotification(message, 'warn'),
    info: (message: string) => showNotification(message, 'info'),
  };
};
