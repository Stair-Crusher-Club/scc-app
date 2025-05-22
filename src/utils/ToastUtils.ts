import {AxiosError} from 'axios';
import Toast, {ToastOptions} from 'react-native-root-toast';

const ToastUtils = {
  show(message: string, options?: ToastOptions): Toast {
    return Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      shadow: false,
      animation: true,
      opacity: 0.85,
      delay: 0,
      ...options,
    });
  },
  showOnApiError(error: any): Toast {
    let message;
    if (typeof error === 'string') {
      message = error;
    } else if (
      error instanceof AxiosError &&
      typeof error.response?.data?.msg === 'string'
    ) {
      message = error.response?.data?.msg;
    } else if (error instanceof Error) {
      message = error.message;
    }
    return this.show(message);
  },
};

export default ToastUtils;
