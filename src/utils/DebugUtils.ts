import {shouldShowDevTool} from '@/components/DevTool/DevTool';
import {logAPICall} from '@/components/DevTool/devToolEventStore';
import {AxiosError, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
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
// 요청별 DevTool 로그 id — 요청 시 PENDING row를 만들고, 응답/에러에서 같은 id로 갱신해
// row가 2개로 쌓이지 않게 한다.
const requestLogIds = new Map<string, string>();

export const logRequest = (config: InternalAxiosRequestConfig) => {
  if (!isAPILoggingEnabled) return;

  const {method, url, data, headers} = config;
  const requestKey = `${method}-${url}`;
  const timestamp = Date.now();
  const logId = `${timestamp}-${Math.random()}`;

  // Store timestamp for duration calculation
  requestTimestamps.set(requestKey, timestamp);
  requestLogIds.set(requestKey, logId);

  console.log('🚀 API Request:', {
    method: method?.toUpperCase(),
    url,
    data,
    headers: headers,
  });

  // Send to DevTool if enabled
  if (shouldShowDevTool()) {
    logAPICall({
      id: logId,
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
  const logId = requestLogIds.get(requestKey);

  // Clean up timestamp
  requestTimestamps.delete(requestKey);
  requestLogIds.delete(requestKey);

  console.log('✅ API Response:', {
    status,
    url: config.url,
    data,
  });

  // Send to DevTool if enabled
  if (shouldShowDevTool()) {
    logAPICall({
      id: logId,
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
    const logId = requestLogIds.get(requestKey);

    // Clean up timestamp
    requestTimestamps.delete(requestKey);
    requestLogIds.delete(requestKey);

    let errorTitle = '';

    if (error.name === 'CanceledError') {
      errorTitle = '🚧 API Aborted:';
    } else {
      errorTitle = '❌ API Error:';
    }

    console.error(errorTitle, {
      context,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });

    // Send to DevTool if enabled
    if (shouldShowDevTool()) {
      logAPICall({
        id: logId,
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
