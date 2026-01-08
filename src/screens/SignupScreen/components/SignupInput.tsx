import React, {forwardRef} from 'react';
import {
  NativeSyntheticEvent,
  ReturnKeyTypeOptions,
  TextInput,
  TextInputFocusEventData,
} from 'react-native';

import UnderlineInput, {UnderlineInputState} from '@/components/UnderlineInput';
import {FormState} from '@/screens/SignupScreen/hooks/useUpdateUser';

interface Props {
  value: string;
  placeholder: string;
  getLabel: (isFocused?: boolean) => string | undefined;
  state: FormState | undefined;
  label?: string;
  onChangeText?: (text: string) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onPress?: () => void;
  onSubmitEditing?: () => void;
  isClearable?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
}

/**
 * SignupInput - UnderlineInput을 감싼 회원가입용 Input 컴포넌트
 * 기존 호환성을 위해 유지
 */
const SignupInput = forwardRef<TextInput, Props>(
  (
    {
      value,
      placeholder,
      getLabel,
      state,
      label,
      onChangeText,
      onBlur,
      onPress,
      onSubmitEditing,
      returnKeyType,
      isClearable = false,
    }: Props,
    ref,
  ) => {
    // FormState를 UnderlineInputState로 변환
    const convertState = (): UnderlineInputState => {
      if (state === undefined) return undefined;
      if (state === 'VALID') return 'VALID';
      if (state === 'PROGRESS') return 'PROGRESS';
      return 'INVALID';
    };

    return (
      <UnderlineInput
        ref={ref}
        value={value}
        placeholder={placeholder}
        label={label}
        getCaptionByFocus={getLabel}
        state={convertState()}
        onChangeText={onChangeText}
        onBlur={onBlur}
        onPress={onPress}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        isClearable={isClearable}
        containerStyle={{marginBottom: 12}}
      />
    );
  },
);

SignupInput.displayName = 'SignupInput';

export default SignupInput;
