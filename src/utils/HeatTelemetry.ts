import {AppState, AppStateStatus} from 'react-native';
import DeviceInfo from 'react-native-device-info';

import Logger from '@/logging/Logger';

const SAMPLE_INTERVAL_MS = 60_000;

export type HeatComponent =
  | 'gps_watch'
  | 'map_native_view'
  | 'camera_active'
  | 'image_upload';

type ActiveStarts = {[K in HeatComponent]?: number};
type Accumulated = {[K in HeatComponent]?: number};

class HeatTelemetry {
  private activeStarts: ActiveStarts = {};
  private accumulated: Accumulated = {};
  private sessionStartedAt: number = Date.now();
  private sessionStartBattery: number | null = null;
  private samplingTimer: ReturnType<typeof setInterval> | null = null;
  private appStateSub: {remove: () => void} | null = null;
  private foregroundElapsedMs = 0;
  private lastForegroundStart: number | null = Date.now();

  start = (component: HeatComponent) => {
    if (this.activeStarts[component] != null) return;
    this.activeStarts[component] = Date.now();
  };

  stop = (component: HeatComponent) => {
    const startedAt = this.activeStarts[component];
    if (startedAt == null) return;
    this.accumulated[component] =
      (this.accumulated[component] ?? 0) + (Date.now() - startedAt);
    this.activeStarts[component] = undefined;
  };

  beginSession = async () => {
    this.sessionStartedAt = Date.now();
    this.accumulated = {};
    this.activeStarts = {};
    this.foregroundElapsedMs = 0;
    this.lastForegroundStart = Date.now();
    this.sessionStartBattery = await this.readBattery();

    if (this.samplingTimer) {
      clearInterval(this.samplingTimer);
    }
    this.samplingTimer = setInterval(() => {
      this.flushSample().catch(() => {});
    }, SAMPLE_INTERVAL_MS);

    if (this.appStateSub) {
      this.appStateSub.remove();
    }
    this.appStateSub = AppState.addEventListener(
      'change',
      this.handleAppStateChange,
    );
  };

  private handleAppStateChange = (state: AppStateStatus) => {
    const now = Date.now();
    if (state === 'active') {
      if (this.lastForegroundStart == null) {
        this.lastForegroundStart = now;
      }
    } else {
      if (this.lastForegroundStart != null) {
        this.foregroundElapsedMs += now - this.lastForegroundStart;
        this.lastForegroundStart = null;
      }
      this.flushSample().catch(() => {});
    }
  };

  private async readBattery(): Promise<number | null> {
    try {
      const level = await DeviceInfo.getBatteryLevel();
      // -1 indicates unavailable (emulator 등)
      return level >= 0 ? level : null;
    } catch {
      return null;
    }
  }

  private snapshotActive(): Accumulated {
    const now = Date.now();
    const snapshot: Accumulated = {...this.accumulated};
    (Object.keys(this.activeStarts) as HeatComponent[]).forEach(comp => {
      const startedAt = this.activeStarts[comp];
      if (startedAt != null) {
        snapshot[comp] = (snapshot[comp] ?? 0) + (now - startedAt);
      }
    });
    return snapshot;
  }

  private async flushSample() {
    const now = Date.now();
    const sessionDurationMs = now - this.sessionStartedAt;
    const fgElapsed =
      this.foregroundElapsedMs +
      (this.lastForegroundStart != null ? now - this.lastForegroundStart : 0);
    const activeNow = this.snapshotActive();
    const currentBattery = await this.readBattery();
    const batteryDelta =
      this.sessionStartBattery != null && currentBattery != null
        ? this.sessionStartBattery - currentBattery
        : null;

    Logger.logHeatSample({
      sessionDurationMs,
      foregroundDurationMs: fgElapsed,
      batteryLevel: currentBattery,
      batteryDeltaSession: batteryDelta,
      gpsWatchMs: activeNow.gps_watch ?? 0,
      mapNativeViewMs: activeNow.map_native_view ?? 0,
      cameraActiveMs: activeNow.camera_active ?? 0,
      imageUploadMs: activeNow.image_upload ?? 0,
    });
  }
}

export default new HeatTelemetry();
