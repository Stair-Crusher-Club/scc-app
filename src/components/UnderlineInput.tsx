import React, {forwardRef} from 'react';
import {
  NativeSyntheticEvent,
  ReturnKeyTypeOptions,
  StyleSheet,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  View,
} from 'react-native';
import styled from 'styled-components/native';
import {match} from 'ts-pattern';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import ArrowDownIcon from '@/assets/icon/ic_arrow_down.svg';
import ClearIcon from '@/assets/icon/ic_clear.svg';
import StyledText from '@/components/StyledText';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export type UnderlineInputState =
  | 'DEFAULT'
  | 'VALID'
  | 'INVALID'
  | 'PROGRESS'
  | undefined;

interface Props {
  value: string;
  placeholder: string;
  label?: string;
  caption?: string;
  getCaptionByFocus?: (isFocused?: boolean) => string | undefined;
  state?: UnderlineInputState;
  onChangeText?: (text: string) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onPress?: () => void;
  onSubmitEditing?: () => void;
  isClearable?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  keyboardType?: TextInputProps['keyboardType'];
  editable?: boolean;
  timer?: string;
  containerStyle?: object;
}

const UnderlineInput = forwardRef<TextInput, Props>(
  (
    {
      value,
      placeholder,
      label,
      caption,
      getCaptionByFocus,
      state,
      onChangeText,
      onBlur,
      onPress,
      onSubmitEditing,
      returnKeyType,
      keyboardType,
      editable = true,
      isClearable = false,
      timer,
      containerStyle,
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
        placeholderTextColor={color.gray40}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        keyboardType={keyboardType}
        editable={editable && !onPress}
        style={[styles.input, !editable && styles.disabledInput]}
        {...props}
      />
    );

    const captionText = getCaptionByFocus?.(isFocused) ?? caption;

    return (
      <InputContainer style={containerStyle}>
        {label && <FieldLabelText>{label}</FieldLabelText>}
        <InputWrapper isFocused={isFocused} isValid={isValid}>
          {onPress ? (
            <SccTouchableOpacity
              elementName="underline_input_dropdown"
              onPress={onPress}
              style={styles.dropdownWrapper}>
              {renderInput({
                pointerEvents: 'none',
              })}
              <ArrowDownIcon width={20} height={20} />
            </SccTouchableOpacity>
          ) : (
            <View style={styles.inputRow}>
              {renderInput()}
              {timer && <TimerText>{timer}</TimerText>}
              {isClearable && value && (
                <SccTouchableOpacity
                  elementName="underline_input_clear"
                  onPress={handleClear}>
                  <ClearIcon width={20} height={20} />
                </SccTouchableOpacity>
              )}
            </View>
          )}
        </InputWrapper>
        {captionText && (
          <StyledText
            style={{
              marginTop: 4,
              fontSize: 12,
              lineHeight: 16,
              fontFamily: font.pretendardRegular,
              color: match(isValid)
                .with(true, () => (isFocused ? color.brandColor : color.gray40))
                .with(false, () => color.red)
                .with(undefined, () => color.gray40)
                .exhaustive(),
            }}
            boldStyle={{
              fontSize: 12,
              lineHeight: 16,
              fontFamily: font.pretendardRegular,
              color: color.brandColor,
            }}
            text={captionText}
          />
        )}
      </InputContainer>
    );
  },
);

UnderlineInput.displayName = 'UnderlineInput';

export default UnderlineInput;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontFamily: font.pretendardRegular,
    fontSize: 16,
    color: color.gray90,
    padding: 0,
    margin: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  disabledInput: {
    color: color.gray50,
  },
  dropdownWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 11,
  },
  inputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 26,
  },
});

const InputContainer = styled.View``;

const FieldLabelText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 18px;
  color: ${color.gray80};
  margin-bottom: 8px;
`;

const InputWrapper = styled.View<{
  isFocused: boolean;
  isValid: boolean | undefined;
}>`
  height: 34px;
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1.5px;
  border-bottom-color: ${props =>
    match(props.isFocused)
      .with(true, () =>
        match(props.isValid)
          .with(undefined, () => color.brandColor)
          .with(true, () => color.brandColor)
          .with(false, () => color.red)
          .exhaustive(),
      )
      .otherwise(() => color.gray20)};
  padding-bottom: 8px;
`;

const TimerText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 12px;
  line-height: 16px;
  color: ${color.red};
`;
