import React from 'react';
import WebSearchScreen from '../screens/WebSearchScreen';
import WebHomeScreen from '../screens/WebHomeScreen';
import {createStackNavigator} from '@react-navigation/stack';

export type WebStackParamList = {
  Home: undefined;
  Search: {
    query?: string;
  };
  PlaceDetail: {
    query: string;
    placeId: string;
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
      </Stack.Navigator>
    </div>
  );
}
