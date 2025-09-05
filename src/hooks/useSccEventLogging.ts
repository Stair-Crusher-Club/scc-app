import {useEffect} from 'react';
import {useRoute} from '@react-navigation/native';
import {useLogParams} from '@/logging/LogParamsProvider';
import {useEventLoggingRegistry} from '@/hooks/useEventLoggingRegistry';
import Logger from '@/logging/Logger';

export interface SccEventLoggingOptions {
  elementName: string;
  logParams?: Record<string, any>;
  disableLogging?: boolean; // 로깅 완전 비활성화
}

export function useSccEventLogging({
  elementName,
  logParams,
  disableLogging = false,
}: SccEventLoggingOptions) {
  const globalLogParams = useLogParams();
  const route = useRoute();

  // 이벤트 로깅 registry에 등록/해제
  const combinedParams = {
    ...globalLogParams,
    ...logParams,
    screen_name: route.name,
  };
  useEventLoggingRegistry(
    elementName,
    disableLogging ? undefined : combinedParams,
  );

  // element_view 로깅
  useEffect(() => {
    if (!disableLogging) {
      Logger.logElementView({
        name: elementName,
        currScreenName: route.name,
        extraParams: combinedParams,
      });
    }
  }, []);

  // element_click 로깅을 위한 핸들러 생성
  const createPressHandler = (
    originalOnPress?: ((event: any) => void) | null,
  ) => {
    return (event: any) => {
      // element_click 로깅 (disableLogging이 false일 때만)
      if (!disableLogging) {
        Logger.logElementClick({
          name: elementName,
          currScreenName: route.name,
          extraParams: combinedParams,
        });
      }

      // 원본 onPress 실행
      if (originalOnPress) {
        originalOnPress(event);
      }
    };
  };

  return {
    createPressHandler,
  };
}
