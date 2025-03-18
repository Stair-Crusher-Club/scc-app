import {AxiosError, AxiosResponse, InternalAxiosRequestConfig} from 'axios';

// Global logging control flags
let isAPILoggingEnabled = __DEV__;

export const setAPILogging = (enabled: boolean) => {
  isAPILoggingEnabled = enabled;
};

export const logDebug = (...args: any[]) => {
  if (__DEV__) {
    console.log(...args);
  }
};

export const logRequest = (config: InternalAxiosRequestConfig) => {
  if (!isAPILoggingEnabled) return;
  
  const {method, url, data, headers} = config;
  console.log('🚀 API Request:', {
    method: method?.toUpperCase(),
    url,
    data,
    headers: headers,
  });
};

export const logResponse = (response: AxiosResponse) => {
  if (!isAPILoggingEnabled) return;

  const {status, data, config} = response;
  console.log('✅ API Response:', {
    status,
    url: config.url,
    data,
  });
};

export const logError = (error: unknown, context?: string) => {
  if (!isAPILoggingEnabled) return;

  if (error instanceof AxiosError) {
    console.error('❌ API Error:', {
      context,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });
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
