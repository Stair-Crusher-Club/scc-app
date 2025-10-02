// Mock implementation of @shopify/flash-list for web
import React from 'react';
import {FlatList} from 'react-native';

// FlashList mock that falls back to FlatList for web compatibility
export const FlashList = React.forwardRef((props, ref) => {
  // Remove FlashList-specific props that don't exist on FlatList
  const {estimatedItemSize, estimatedListSize, drawDistance, ...flatListProps} =
    props;

  return React.createElement(FlatList, {
    ref,
    ...flatListProps,
  });
});

// Export default for CommonJS compatibility
export default {FlashList};
