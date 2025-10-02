import {atom} from 'jotai';
import {shouldShowDevTool} from './DevTool';

export interface DevToolLoggedEvent {
  id: string;
  timestamp: number;
  eventName: string;
  params: Record<string, any>;
}

export interface DevToolAPILog {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseStatus?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  duration?: number;
  error?: string;
}

// Store for logged events (max 200)
export const loggedEventsAtom = atom<DevToolLoggedEvent[]>([]);

// Store for API logs (max 100)
export const apiLogsAtom = atom<DevToolAPILog[]>([]);

// Helper to add event to store
export const convertToDevToolLoggedEvent = (
  events: DevToolLoggedEvent[],
  newEvent: Omit<DevToolLoggedEvent, 'id' | 'timestamp'>,
): DevToolLoggedEvent[] => {
  const event: DevToolLoggedEvent = {
    ...newEvent,
    id: `${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
  };

  // Keep only last 200 events
  const updatedEvents = [event, ...events].slice(0, 200);
  return updatedEvents;
};

// Helper to add API log to store
export const convertToDevToolAPILog = (
  apiLogs: DevToolAPILog[],
  newLog: Omit<DevToolAPILog, 'id' | 'timestamp'> & {timestamp?: number},
): DevToolAPILog[] => {
  const log: DevToolAPILog = {
    ...newLog,
    id: `${Date.now()}-${Math.random()}`,
    timestamp: newLog.timestamp || Date.now(),
  };

  // Keep only last 100 API logs
  const updatedLogs = [log, ...apiLogs].slice(0, 100);
  return updatedLogs;
};

// DevTool API tracking helpers
let apiLoggingEnabled = false;
let setAPILogs: ((apiLogs: any) => void) | null = null;

export const initializeAPILoggingDevTool = (
  setter: (apiLogs: any) => void,
) => {
  apiLoggingEnabled = true;
  setAPILogs = setter;
};

const trackAPI = (apiLog: Omit<DevToolAPILog, 'id' | 'timestamp'> & {timestamp?: number}) => {
  if (shouldShowDevTool() && apiLoggingEnabled && setAPILogs) {
    setAPILogs((prev: any) =>
      convertToDevToolAPILog(prev, apiLog),
    );
  }
};

// Export for external API interceptors to use
export const logAPICall = trackAPI;
