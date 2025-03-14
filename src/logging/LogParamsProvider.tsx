import React, {createContext, ReactNode, useContext} from 'react';

const LogParamsContext = createContext<Record<string, any> | null>(null);

interface Props {
  children: ReactNode;
  params?: Record<string, any>;
}

export function LogParamsProvider({children, params}: Props) {
  const parentParams = useContext(LogParamsContext);

  return (
    <LogParamsContext.Provider value={{...parentParams, ...params}}>
      {children}
    </LogParamsContext.Provider>
  );
}

export function useLogParams(): Record<string, any> {
  return useContext(LogParamsContext) ?? {};
}
