import React from 'react';
import WebSearchScreen from '../screens/WebSearchScreen';
import {createStackNavigator} from '@react-navigation/stack';

export type WebStackParamList = {
  Search: undefined;
};

const Stack = createStackNavigator<WebStackParamList>();

export default function WebNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="Search"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Search" component={WebSearchScreen} />
    </Stack.Navigator>
  );
}
