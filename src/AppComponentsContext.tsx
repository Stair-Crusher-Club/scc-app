import React, {PropsWithChildren} from 'react';
import {createContext} from 'react';

import {DefaultApi} from '@/generated-sources/openapi';

interface AppComponents extends PropsWithChildren {
  api: DefaultApi;
}

export const AppComponentsContext = createContext<AppComponents>({
  api: new DefaultApi(),
});

export const AppComponentsProvider = ({children, api}: AppComponents) => {
  return (
    <AppComponentsContext.Provider value={{api: api}}>
      {children}
    </AppComponentsContext.Provider>
  );
};
