import React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Provider as JotaiProvider} from 'jotai';
import {NavigationContainer} from '@react-navigation/native';

import {AppComponentsProvider} from '@/AppComponentsContext';
import WebNavigation from './navigation/WebNavigation';
import {api} from './config/api';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export default function DesktopApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <AppComponentsProvider api={api}>
          <NavigationContainer
            documentTitle={{
              formatter: () => '계단뿌셔클럽',
            }}
            linking={{
              prefixes: ['http://localhost:3000', 'https://your-domain.com'],
              config: {
                screens: {
                  Search: {
                    path: 'search/:query',
                    exact: true,
                    parse: {
                      query: (query: string) => decodeURIComponent(query),
                    },
                  },
                  PlaceDetail: {
                    path: 'search/:query/place/:placeId',
                    parse: {
                      query: (query: string) => decodeURIComponent(query),
                      placeId: (placeId: string) => placeId,
                    },
                  },
                },
              },
            }}>
            <WebNavigation />
          </NavigationContainer>
        </AppComponentsProvider>
      </JotaiProvider>
    </QueryClientProvider>
  );
}
