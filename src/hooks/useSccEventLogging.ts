import {useEffect, useRef} from 'react';
import {useRoute} from '@react-navigation/native';
import {useIsFocused} from '@react-navigation/native';
import {useLogParams} from '@/logging/LogParamsProvider';
import {useEventLoggingRegistry} from '@/hooks/useEventLoggingRegistry';
import {logElementClick, logElementView} from '@/logging/Logger';

export interface SccEventLoggingOptions {
  elementName: string;
  logParams?: Record<string, any>;
  disableLogging?: boolean; // 로깅 완전 비활성화
  trackView?: boolean;
}

export function useSccEventLogging({
  elementName,
  logParams,
  disableLogging = false,
  trackView = false,
}: SccEventLoggingOptions) {
  const globalLogParams = useLogParams();
  const route = useRoute();
  const isFocused = useIsFocused();

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

  // element_view: opt-in + focused screen guard (blur 시 리셋하여 재방문 시 재발사)
  const hasLoggedRef = useRef(false);
  useEffect(() => {
    if (!isFocused) {
      hasLoggedRef.current = false;
      return;
    }

    if (!disableLogging && trackView && !hasLoggedRef.current) {
      logElementView({
        name: elementName,
        currScreenName: route.name,
        extraParams: combinedParams,
      });
      hasLoggedRef.current = true;
    }
  }, [isFocused, trackView, disableLogging]);

  // element_click 로깅을 위한 핸들러 생성
  const createPressHandler = (
    originalOnPress?: ((event: any) => void) | null,
  ) => {
    return (event: any) => {
      // element_click 로깅 (disableLogging이 false일 때만)
      if (!disableLogging) {
        logElementClick({
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
