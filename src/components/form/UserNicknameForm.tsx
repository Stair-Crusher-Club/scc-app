import React, {forwardRef} from 'react';
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputFocusEventData,
  View,
} from 'react-native';
import {match, Pattern} from 'ts-pattern';

import SignupBoxInput from '@/screens/SignupScreen/components/SignupBoxInput';
import {UserFormState} from '@/screens/SignupScreen/hooks/useUpdateUser';

interface UserNicknameFormProps {
  value: string;
  state: UserFormState['nickname'];
  onChangeText: (value: string) => Promise<void>;
  onBlur?: () => void;
  onFocus?: () => void;
  onSubmitEditing?: () => void;
  isClearable?: boolean;
}

const UserNicknameForm = forwardRef<TextInput, UserNicknameFormProps>(
  (
    {
      value,
      state,
      onChangeText,
      onBlur,
      onFocus,
      onSubmitEditing,
      isClearable = false,
    },
    ref,
  ) => {
    return (
      <View style={{paddingHorizontal: 20}}>
        <SignupBoxInput
          ref={ref}
          label="닉네임"
          isRequired
          placeholder="닉네임을 입력해주세요"
          returnKeyType="next"
          state={state}
          caption={match(state)
            .with(undefined, () => '닉네임은 영어, 한글, 숫자만 사용 가능해요.')
            .with('VALID', () => '사용 가능한 닉네임입니다.')
            .with('PROGRESS', () => '닉네임 확인 중...')
            .with({errorMessage: Pattern.string}, error => error.errorMessage)
            .exhaustive()}
          value={value}
          onChangeText={onChangeText}
          onBlur={
            onBlur
              ? (_e: NativeSyntheticEvent<TextInputFocusEventData>) => onBlur()
              : undefined
          }
          onFocus={onFocus}
          onSubmitEditing={onSubmitEditing}
          isClearable={isClearable}
        />
      </View>
    );
  },
);

UserNicknameForm.displayName = 'UserNicknameForm';

export default UserNicknameForm;
