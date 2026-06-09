import React, {PropsWithChildren} from 'react';
import {createContext} from 'react';

import {DefaultApi, ToiletApi} from '@/generated-sources/openapi';

interface AppComponents extends PropsWithChildren {
  api: DefaultApi;
  toiletApi: ToiletApi;
}

export const AppComponentsContext = createContext<AppComponents>({
  api: new DefaultApi(),
  toiletApi: new ToiletApi(),
});

export const AppComponentsProvider = ({
  children,
  api,
  toiletApi,
}: AppComponents) => {
  return (
    <AppComponentsContext.Provider value={{api, toiletApi}}>
      {children}
    </AppComponentsContext.Provider>
  );
};
