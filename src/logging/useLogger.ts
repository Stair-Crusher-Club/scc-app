import {useRoute} from '@react-navigation/native';
import {logElementClick, logElementView} from './Logger';
import {useLogParams} from './LogParamsProvider';

export function useLogger() {
  const globalLogParams = useLogParams();
  const route = useRoute();

  return {
    logElementView: (name: string, extraParams?: Record<string, any>) => {
      logElementView({
        name,
        currScreenName: route.name,
        extraParams: {...globalLogParams, ...extraParams},
      });
    },
    logElementClick: (name: string, extraParams?: Record<string, any>) => {
      logElementClick({
        name,
        currScreenName: route.name,
        extraParams: {...globalLogParams, ...extraParams},
      });
    },
  };
}
