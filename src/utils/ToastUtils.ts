import {AxiosError} from 'axios';
import Toast from 'react-native-root-toast';

const ToastUtils = {
  show(message: string): Toast {
    return Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      shadow: false,
      animation: true,
      opacity: 0.85,
      delay: 0,
    });
  },
  showOnApiError(error: any): Toast {
    let message;
    if (error instanceof String) {
      message = error;
    }
    if (
      error instanceof AxiosError &&
      error.response?.data?.msg instanceof String // msg from ApiErrorResponse
    ) {
      message = error.response?.data?.msg;
    }
    if (error instanceof Error) {
      message = error.message;
    }
    console.log(error);
    return this.show(message);
  },
};

export default ToastUtils;
