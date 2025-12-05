import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useWindowDimensions } from 'react-native';
import { DESKTOP_BREAKPOINT } from '../constants/layout';

interface ResponsiveContextValue {
  /** 현재 viewport width */
  windowWidth: number;
  /** 현재 viewport height */
  windowHeight: number;
  /** Desktop 여부 (width >= DESKTOP_BREAKPOINT) */
  isDesktop: boolean;
  /** Mobile 여부 (width < DESKTOP_BREAKPOINT) */
  isMobile: boolean;
}

const ResponsiveContext = createContext<ResponsiveContextValue | null>(null);

interface ResponsiveProviderProps {
  children: ReactNode;
}

export function ResponsiveProvider({ children }: ResponsiveProviderProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const value = useMemo<ResponsiveContextValue>(
    () => ({
      windowWidth,
      windowHeight,
      isDesktop: windowWidth >= DESKTOP_BREAKPOINT,
      isMobile: windowWidth < DESKTOP_BREAKPOINT,
    }),
    [windowWidth, windowHeight],
  );

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
}

/**
 * Responsive Context 사용 hook
 * @throws ResponsiveProvider 내부가 아닐 때 에러
 */
export function useResponsive(): ResponsiveContextValue {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within ResponsiveProvider');
  }
  return context;
}
