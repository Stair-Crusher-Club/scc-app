import {useEffect} from 'react';
import {useRoute} from '@react-navigation/native';
import {useLogParams} from '@/logging/LogParamsProvider';
import {useEventLoggingRegistry} from '@/hooks/useEventLoggingRegistry';
import Logger from '@/logging/Logger';

export interface SccEventLoggingOptions {
  elementName: string;
  logParams?: Record<string, any>;
  logElementViewOnMount?: boolean;
  hasBeenVisible?: boolean; // viewport visibility 사용 시
}

export function useSccEventLogging({
  elementName,
  logParams,
  logElementViewOnMount = true,
  hasBeenVisible,
}: SccEventLoggingOptions) {
  const globalLogParams = useLogParams();
  const route = useRoute();

  // 이벤트 로깅 registry에 등록/해제
  const combinedParams = {...globalLogParams, ...logParams};
  useEventLoggingRegistry(elementName, combinedParams);

  // element_view 로깅
  useEffect(() => {
    if (logElementViewOnMount) {
      // viewport visibility 사용하는 경우
      if (hasBeenVisible !== undefined) {
        if (hasBeenVisible) {
          Logger.logElementView({
            name: elementName,
            currScreenName: route.name,
            extraParams: combinedParams,
          });
        }
      } else {
        // 즉시 로깅하는 경우 (mount 시점)
        Logger.logElementView({
          name: elementName,
          currScreenName: route.name,
          extraParams: combinedParams,
        });
      }
    }
  }, [
    elementName,
    route.name,
    combinedParams,
    logElementViewOnMount,
    hasBeenVisible,
  ]);

  // element_click 로깅을 위한 핸들러 생성
  const createPressHandler = (
    originalOnPress?: ((event: any) => void) | null,
  ) => {
    return (event: any) => {
      // element_click 로깅 (매번)
      Logger.logElementClick({
        name: elementName,
        currScreenName: route.name,
        extraParams: combinedParams,
      });

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
