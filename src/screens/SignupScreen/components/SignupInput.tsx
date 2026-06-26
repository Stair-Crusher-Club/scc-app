import React, {forwardRef} from 'react';
import {
  NativeSyntheticEvent,
  ReturnKeyTypeOptions,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
} from 'react-native';

import SignupBoxInput from '@/screens/SignupScreen/components/SignupBoxInput';
import {FormState} from '@/screens/SignupScreen/hooks/useUpdateUser';

interface Props {
  value: string;
  placeholder: string;
  getLabel: (isFocused?: boolean) => string | undefined;
  state: FormState | undefined;
  label?: string;
  isRequired?: boolean;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onPress?: () => void;
  onSubmitEditing?: () => void;
  isClearable?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  keyboardType?: TextInputProps['keyboardType'];
  maxLength?: number;
}

/**
 * SignupInput — SignupBoxInput을 감싼 회원가입용 Input 컴포넌트.
 * getLabel로 caption 텍스트를 받아 SignupBoxInput에 전달한다.
 */
const SignupInput = forwardRef<TextInput, Props>(
  (
    {
      value,
      placeholder,
      getLabel,
      state,
      label,
      isRequired,
      onChangeText,
      onFocus,
      onBlur,
      onPress,
      onSubmitEditing,
      returnKeyType,
      keyboardType,
      maxLength,
      isClearable = false,
    },
    ref,
  ) => {
    return (
      <SignupBoxInput
        ref={ref}
        value={value}
        placeholder={placeholder}
        label={label}
        isRequired={isRequired}
        state={state}
        caption={getLabel()}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        onPress={onPress}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        keyboardType={keyboardType}
        maxLength={maxLength}
        isClearable={isClearable}
      />
    );
  },
);

SignupInput.displayName = 'SignupInput';

export default SignupInput;
