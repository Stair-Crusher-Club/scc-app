import React from 'react';
import WebSearchScreen from '../screens/WebSearchScreen';
import WebHomeScreen from '../screens/WebHomeScreen';
import {createStackNavigator} from '@react-navigation/stack';
import ImageZoomViewerScreen from '../../src/screens/ImageZoomViewerScreen';

export type WebStackParamList = {
  Home: undefined;
  Search: {
    query?: string;
  };
  PlaceDetail: {
    query: string;
    placeId: string;
  };
  ImageZoomViewer: {
    imageUrls: string[];
    index?: number;
    types?: string[];
  };
};

const Stack = createStackNavigator<WebStackParamList>();

export default function WebNavigation() {
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Home" component={WebHomeScreen} />
        <Stack.Screen name="Search" component={WebSearchScreen} />
        <Stack.Screen name="PlaceDetail" component={WebSearchScreen} />
        <Stack.Screen
          name="ImageZoomViewer"
          component={ImageZoomViewerScreen}
          options={{
            presentation: 'transparentModal',
            headerShown: false,
            cardStyle: { backgroundColor: 'transparent' }
          }}
        />
      </Stack.Navigator>
    </div>
  );
}
