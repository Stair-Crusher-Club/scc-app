import React, {forwardRef} from 'react';
import {
  NativeSyntheticEvent,
  ReturnKeyTypeOptions,
  StyleSheet,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import styled from 'styled-components/native';
import {match} from 'ts-pattern';

import ArrowDownIcon from '@/assets/icon/ic_arrow_down.svg';
import ClearIcon from '@/assets/icon/ic_clear.svg';
import StyledText from '@/components/StyledText';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {FormState} from '@/screens/SignupScreen/hooks/useUpdateUser';

interface Props {
  value: string;
  placeholder: string;
  getLabel: (isFocused?: boolean) => string | undefined;
  state: FormState | undefined;
  onChangeText?: (text: string) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onPress?: () => void;
  onSubmitEditing?: () => void;
  isClearable?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
}

const SignupInput = forwardRef<TextInput, Props>(
  (
    {
      value,
      placeholder,
      getLabel,
      state,
      onChangeText,
      onBlur,
      onPress,
      onSubmitEditing,
      returnKeyType,
      isClearable = false,
    }: Props,
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const localRef = React.useRef<TextInput>(null);

    React.useImperativeHandle(ref, () => localRef.current as TextInput);

    const isValid =
      state === undefined
        ? undefined
        : state === 'VALID' || state === 'PROGRESS';

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleClear = () => {
      onChangeText?.('');
      localRef.current?.focus();
    };

    const renderInput = (props?: TextInputProps) => (
      <TextInput
        ref={localRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={color.gray50}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        editable={!onPress}
        style={styles.input}
        {...props}
      />
    );

    const label = getLabel(isFocused);

    return (
      <InputContainer>
        <InputWrapper isFocused={isFocused} isValid={isValid}>
          {onPress ? (
            <TouchableOpacity
              onPress={onPress}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                paddingRight: 11,
              }}>
              {renderInput({
                pointerEvents: 'none',
              })}
              <ArrowDownIcon width={20} height={20} />
            </TouchableOpacity>
          ) : (
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                paddingRight: 8,
              }}>
              {renderInput()}
              {isClearable && value && (
                <TouchableOpacity onPress={handleClear}>
                  <ClearIcon width={20} height={20} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </InputWrapper>
        {label && (
          <StyledText
            style={{
              fontSize: 12,
              fontFamily: font.pretendardMedium,
              color: isValid
                ? color.brandColor
                : isValid === false
                ? color.red
                : color.gray50,
            }}
            boldStyle={{
              fontSize: 12,
              fontFamily: font.pretendardMedium,
              color: color.gray50,
            }}
            text={label}
          />
        )}
      </InputContainer>
    );
  },
);

SignupInput.displayName = 'SignupInput';

export default SignupInput;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontFamily: font.pretendardMedium,
    fontSize: 16,
    color: color.gray100,
    padding: 0,
  },
});

const InputContainer = styled.View`
  margin-bottom: 24px;
`;

const InputWrapper = styled.View<{
  isFocused: boolean;
  isValid: boolean | undefined;
}>`
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: ${props =>
    match(props.isFocused)
      .with(true, () =>
        match(props.isValid)
          .with(undefined, () => color.gray20)
          .with(true, () => color.blue50)
          .with(false, () => color.red)
          .exhaustive(),
      )
      .otherwise(() => color.gray20)};
  padding-bottom: 8px;
  margin-bottom: 4px;
`;
