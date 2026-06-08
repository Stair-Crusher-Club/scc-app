import React, {PropsWithChildren} from 'react';
import {createContext} from 'react';

import {DefaultApi, ToiletAccessibilityApi} from '@/generated-sources/openapi';

interface AppComponents extends PropsWithChildren {
  api: DefaultApi;
  toiletAccessibilityApi: ToiletAccessibilityApi;
}

export const AppComponentsContext = createContext<AppComponents>({
  api: new DefaultApi(),
  toiletAccessibilityApi: new ToiletAccessibilityApi(),
});

export const AppComponentsProvider = ({
  children,
  api,
  toiletAccessibilityApi,
}: AppComponents) => {
  return (
    <AppComponentsContext.Provider value={{api, toiletAccessibilityApi}}>
      {children}
    </AppComponentsContext.Provider>
  );
};
