import React, {createContext, useContext, useMemo, useState} from 'react';

interface SearchScreenContextValue {
  isFromLookup: boolean;
  setIsFromLookup: (value: boolean) => void;
}

const SearchScreenContext = createContext<SearchScreenContextValue | null>(
  null,
);

export function SearchScreenProvider({children}: {children: React.ReactNode}) {
  const [isFromLookup, setIsFromLookup] = useState(false);

  const value = useMemo(
    () => ({
      isFromLookup,
      setIsFromLookup,
    }),
    [isFromLookup],
  );

  return (
    <SearchScreenContext.Provider value={value}>
      {children}
    </SearchScreenContext.Provider>
  );
}

export function useSearchScreenContext() {
  const context = useContext(SearchScreenContext);
  if (!context) {
    throw new Error(
      'useSearchScreenContext must be used within SearchScreenProvider',
    );
  }
  return context;
}
