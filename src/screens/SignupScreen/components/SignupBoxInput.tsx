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
import {useKeyboardAwareFocus} from '@/components/KeyboardAwareFormScrollView';
import ClearIcon from '@/assets/icon/ic_clear.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {FormState} from '@/screens/SignupScreen/hooks/useUpdateUser';

export type SignupBoxInputState = FormState | undefined;

interface Props {
  value: string;
  placeholder: string;
  label?: string;
  isRequired?: boolean;
  caption?: string;
  captionColor?: string;
  state?: SignupBoxInputState;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onPress?: () => void;
  onSubmitEditing?: () => void;
  isClearable?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  keyboardType?: TextInputProps['keyboardType'];
  maxLength?: number;
  editable?: boolean;
  timer?: string;
  rightElement?: React.ReactNode;
}

/**
 * SignupBoxInput — 회원가입 화면 전용 박스형 입력 컴포넌트.
 * Figma 디자인: border 1.5px #EBEBEF rounded-8, height 50, font 18px Regular.
 * focus 시 파란 테두리(#0C76F7), error 시 빨간 테두리(#DB0B24).
 */
const SignupBoxInput = forwardRef<TextInput, Props>(
  (
    {
      value,
      placeholder,
      label,
      isRequired,
      caption,
      captionColor,
      state,
      onChangeText,
      onFocus: onFocusProp,
      onBlur,
      onPress,
      onSubmitEditing,
      returnKeyType,
      keyboardType,
      maxLength,
      editable = true,
      isClearable = false,
      timer,
      rightElement,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const localRef = React.useRef<TextInput>(null);
    const {notifyInputFocus} = useKeyboardAwareFocus();

    React.useImperativeHandle(ref, () => localRef.current as TextInput);

    const isValid =
      state === undefined
        ? undefined
        : state === 'VALID' || state === 'PROGRESS';

    const handleFocus = () => {
      setIsFocused(true);
      onFocusProp?.();
      // 래퍼(KeyboardAwareFormScrollView) 안이면 포커스된 input이 보이도록 스크롤 보정.
      notifyInputFocus();
    };

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleClear = () => {
      onChangeText?.('');
      localRef.current?.focus();
    };

    const getBorderColor = () => {
      if (isValid === false) return color.red;
      if (isFocused) return color.brand40;
      return color.gray20;
    };

    const getCaptionColor = () => {
      if (captionColor) return captionColor;
      return match(isValid)
        .with(true, () => (isFocused ? color.brand40 : color.gray50v2))
        .with(false, () => color.red)
        .with(undefined, () => color.gray50v2)
        .exhaustive();
    };

    const renderInputContent = () => (
      <>
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
          maxLength={maxLength}
          editable={editable && !onPress}
          style={[styles.input, !editable && styles.disabledInput]}
        />
        {timer && <TimerText>{timer}</TimerText>}
        {isClearable && value ? (
          <SccTouchableOpacity
            elementName="signup_box_input_clear"
            hitSlop={12}
            onPress={handleClear}>
            <ClearIcon width={20} height={20} />
          </SccTouchableOpacity>
        ) : null}
        {rightElement}
      </>
    );

    return (
      <Container>
        {label && (
          <LabelRow>
            <LabelText>{label}</LabelText>
            {isRequired && <RequiredMark> *</RequiredMark>}
          </LabelRow>
        )}
        <InputBox borderColor={getBorderColor()}>
          {onPress ? (
            <SccTouchableOpacity
              elementName="signup_box_input_press"
              onPress={onPress}
              style={styles.inputRow}>
              {renderInputContent()}
            </SccTouchableOpacity>
          ) : (
            <View style={styles.inputRow}>{renderInputContent()}</View>
          )}
        </InputBox>
        {caption && (
          <CaptionText style={{color: getCaptionColor()}}>
            {caption}
          </CaptionText>
        )}
      </Container>
    );
  },
);

SignupBoxInput.displayName = 'SignupBoxInput';

export default SignupBoxInput;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontFamily: font.pretendardRegular,
    fontSize: 18,
    letterSpacing: -0.36,
    color: color.gray90v2,
    padding: 0,
    margin: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  disabledInput: {
    color: color.gray50v2,
  },
  inputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

const Container = styled.View``;

const LabelRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding-left: 6px;
  margin-bottom: 8px;
`;

const LabelText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.gray80v2};
`;

const RequiredMark = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 18px;
  color: ${color.red};
`;

const InputBox = styled.View<{borderColor: string}>`
  height: 50px;
  flex-direction: row;
  align-items: center;
  border-width: 1.5px;
  border-color: ${props => props.borderColor};
  border-radius: 8px;
  padding-horizontal: 12px;
  padding-vertical: 10px;
`;

const TimerText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.red};
`;

const CaptionText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  margin-top: 4px;
`;
