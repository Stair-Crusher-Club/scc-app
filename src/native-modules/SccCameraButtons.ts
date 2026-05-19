import {NativeEventEmitter, NativeModules} from 'react-native';

const EVENT_CAPTURE_PRESS = 'SccCameraButtonsCapturePress';

interface SccCameraButtonsNativeModule {
  attach(): Promise<boolean>;
  detach(): Promise<boolean>;
  // RN built-in EventEmitter API
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

const nativeModule = NativeModules.SccCameraButtons as
  | SccCameraButtonsNativeModule
  | undefined;

const emitter = nativeModule
  ? new NativeEventEmitter(nativeModule as unknown as never)
  : null;

export interface CaptureButtonSubscription {
  remove(): void;
}

/**
 * 카메라 화면에서 음량 버튼을 셔터로 사용하기 위한 네이티브 모듈 래퍼.
 *
 * - iOS 17.2+: AVCaptureEventInteraction (시스템이 볼륨 버튼 이벤트를 가로채 앱으로
 *   전달, 시스템 볼륨/HUD 변화 없음, edge case 정상 동작)
 * - iOS 15.1~17.1: AVAudioSession.outputVolume KVO + 숨겨진 MPVolumeView로 HUD 억제
 *   (볼륨 0/1.0 edge case에서는 동작 안 함)
 * - Android: MainActivity.dispatchKeyEvent에서 KEYCODE_VOLUME_UP/DOWN을 가로채서 emit
 */
export const SccCameraButtons = {
  isAvailable: nativeModule != null,

  attach(): Promise<boolean> {
    if (!nativeModule) {
      return Promise.resolve(false);
    }
    return nativeModule.attach();
  },

  detach(): Promise<boolean> {
    if (!nativeModule) {
      return Promise.resolve(false);
    }
    return nativeModule.detach();
  },

  addCapturePressListener(callback: () => void): CaptureButtonSubscription {
    if (!emitter) {
      return {remove() {}};
    }
    const sub = emitter.addListener(EVENT_CAPTURE_PRESS, callback);
    return {
      remove() {
        sub.remove();
      },
    };
  },
};
