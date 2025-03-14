import React from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import SearchIcon from '@/assets/icon/ic_search.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface SccInputProps extends TextInputProps {
  noIcon?: boolean;
  placeholder?: string;
  setValue?: any;
  style?: ViewStyle;
}

export const SccInput = ({
  noIcon = false,
  placeholder = '',
  setValue = () => {},
  style = {},
  ...props
}: SccInputProps) => {
  return (
    <View style={[styles.search, style]}>
      {!noIcon && (
        <SearchIcon width={20} height={20} style={styles.searchIcon} />
      )}
      <TextInput
        style={styles.searchText}
        placeholder={placeholder}
        placeholderTextColor={color.gray70}
        onChangeText={text => setValue(text)}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  search: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: color.gray20,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  searchIcon: {
    marginRight: 20,
  },
  searchText: {
    flex: 1,
    color: color.black,
    fontFamily: font.pretendardMedium,
    fontSize: 18,
    marginTop: -1,
    paddingVertical: 0,
  },
});
