import {useRoute} from '@react-navigation/native';
import {logElementClick, logElementView} from './Logger';
import {useLogParams} from './LogParamsProvider';

/**
 * @param localParams 같은 컴포넌트의 LogParamsProvider에 넘기는 값과 동일하게 전달.
 *   useLogger()는 자기 render의 LogParamsProvider를 볼 수 없으므로(React context 한계),
 *   localParams로 동일 값을 주입한다.
 *   merge 순서: parentLogParams < localParams < extraParams (뒤가 우선)
 */
export function useLogger(localParams?: Record<string, any>) {
  const globalLogParams = useLogParams();
  const route = useRoute();

  return {
    logElementView: (name: string, extraParams?: Record<string, any>) => {
      logElementView({
        name,
        currScreenName: route.name,
        extraParams: {...globalLogParams, ...localParams, ...extraParams},
      });
    },
    logElementClick: (name: string, extraParams?: Record<string, any>) => {
      logElementClick({
        name,
        currScreenName: route.name,
        extraParams: {...globalLogParams, ...localParams, ...extraParams},
      });
    },
  };
}
