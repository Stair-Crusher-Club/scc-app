import {AxiosError, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {logAPICall} from '@/components/DevTool/devToolEventStore';
import {shouldShowDevTool} from '@/components/DevTool/DevTool';
import Config from 'react-native-config';

// Global logging control flags
let isAPILoggingEnabled = Config.ENABLE_DEVTOOL === 'true';

export const setAPILogging = (enabled: boolean) => {
  isAPILoggingEnabled = enabled;
};

export const logDebug = (...args: any[]) => {
  if (__DEV__) {
    console.log(...args);
  }
};

// Store for tracking request timing
const requestTimestamps = new Map<string, number>();

export const logRequest = (config: InternalAxiosRequestConfig) => {
  if (!isAPILoggingEnabled) return;

  const {method, url, data, headers} = config;
  const requestKey = `${method}-${url}`;
  const timestamp = Date.now();

  // Store timestamp for duration calculation
  requestTimestamps.set(requestKey, timestamp);

  console.log('🚀 API Request:', {
    method: method?.toUpperCase(),
    url,
    data,
    headers: headers,
  });

  // Send to DevTool if enabled
  if (shouldShowDevTool()) {
    logAPICall({
      method: method?.toUpperCase() || 'UNKNOWN',
      url: url || '',
      requestHeaders: headers as Record<string, string>,
      requestBody: data,
      timestamp,
    });
  }
};

export const logResponse = (response: AxiosResponse) => {
  if (!isAPILoggingEnabled) return;

  const {status, data, config, headers} = response;
  const requestKey = `${config.method}-${config.url}`;
  const endTime = Date.now();
  const startTime = requestTimestamps.get(requestKey);
  const duration = startTime ? endTime - startTime : undefined;

  // Clean up timestamp
  requestTimestamps.delete(requestKey);

  console.log('✅ API Response:', {
    status,
    url: config.url,
    data,
  });

  // Send to DevTool if enabled
  if (shouldShowDevTool()) {
    logAPICall({
      method: config.method?.toUpperCase() || 'UNKNOWN',
      url: config.url || '',
      requestHeaders: config.headers as Record<string, string>,
      requestBody: config.data,
      responseStatus: status,
      responseHeaders: headers as Record<string, string>,
      responseBody: data,
      duration,
      timestamp: startTime || endTime,
    });
  }
};

export const logError = (error: unknown, context?: string) => {
  if (!isAPILoggingEnabled) return;

  if (error instanceof AxiosError) {
    const requestKey = `${error.config?.method}-${error.config?.url}`;
    const endTime = Date.now();
    const startTime = requestTimestamps.get(requestKey);
    const duration = startTime ? endTime - startTime : undefined;

    // Clean up timestamp
    requestTimestamps.delete(requestKey);

    console.error('❌ API Error:', {
      context,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });

    // Send to DevTool if enabled
    if (shouldShowDevTool()) {
      logAPICall({
        method: error.config?.method?.toUpperCase() || 'UNKNOWN',
        url: error.config?.url || '',
        requestHeaders: error.config?.headers as Record<string, string>,
        requestBody: error.config?.data,
        responseStatus: error.response?.status,
        responseHeaders: error.response?.headers as Record<string, string>,
        responseBody: error.response?.data,
        error: `${error.message}${context ? ` (${context})` : ''}`,
        duration,
        timestamp: startTime || endTime,
      });
    }
  } else if (error instanceof Error) {
    console.error('❌ Error:', {
      context,
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error('❌ Unknown Error:', {
      context,
      error,
    });
  }
};
