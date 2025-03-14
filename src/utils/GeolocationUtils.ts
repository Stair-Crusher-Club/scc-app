import Geolocation, {
  GeolocationResponse,
} from '@react-native-community/geolocation';

const GeolocationUtils = {
  requestPermission(): Promise<void> {
    return new Promise((resolve, reject) => {
      Geolocation.requestAuthorization(
        () => {
          resolve();
        },
        error => {
          reject(error);
        },
      );
    });
  },
  getCurrentPosition(): Promise<GeolocationResponse> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        success => {
          resolve(success);
        },
        error => {
          reject(error);
        },
      );
    });
  },
};

export default GeolocationUtils;
