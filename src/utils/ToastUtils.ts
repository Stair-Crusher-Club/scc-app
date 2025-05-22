import {AxiosError} from 'axios';
import Toast, {ToastOptions} from 'react-native-root-toast';

import {font} from '@/constant/font';

const ToastUtils = {
  show(message: string, options?: ToastOptions): Toast {
    return Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      shadow: false,
      animation: true,
      opacity: 0.85,
      delay: 0,
      textStyle: {
        fontFamily: font.pretendardMedium,
      },
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
