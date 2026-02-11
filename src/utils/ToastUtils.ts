import {AxiosError} from 'axios';
import Toast, {ToastOptions} from 'react-native-root-toast';

import {font} from '@/constant/font';

const ToastUtils = {
  show(message: string, options?: ToastOptions): Toast {
    return Toast.show(message, {
      duration: 2500,
      position: -55,
      shadow: false,
      animation: true,
      opacity: 1,
      delay: 0,
      containerStyle: {
        width: 350,
        minHeight: 56,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
      },
      textStyle: {
        fontFamily: font.pretendardMedium,
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 24,
        letterSpacing: -0.32,
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
