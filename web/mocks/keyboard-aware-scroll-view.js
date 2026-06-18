// Web mock for react-native-keyboard-aware-scroll-view (Flow source that babel
// can't parse). On web there is no soft keyboard inset to manage, so a plain
// ScrollView is a faithful substitute.
import React from 'react';
import {ScrollView} from 'react-native';

export const KeyboardAwareScrollView = React.forwardRef((props, ref) =>
  React.createElement(ScrollView, {ref, ...props}),
);

export const KeyboardAwareFlatList = KeyboardAwareScrollView;
export const KeyboardAwareSectionList = KeyboardAwareScrollView;

export default {KeyboardAwareScrollView};
