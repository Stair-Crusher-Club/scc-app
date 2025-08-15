import React, {forwardRef} from 'react';
import {View, TextInput} from 'react-native';
import {match, Pattern} from 'ts-pattern';

import SignupInput from '@/screens/SignupScreen/components/SignupInput';
import {UserFormState} from '@/screens/SignupScreen/hooks/useUpdateUser';

interface UserNicknameFormProps {
  value: string;
  state: UserFormState['nickname'];
  onChangeText: (value: string) => Promise<void>;
  onSubmitEditing?: () => void;
  isClearable?: boolean;
}

const UserNicknameForm = forwardRef<TextInput, UserNicknameFormProps>(
  ({value, state, onChangeText, onSubmitEditing, isClearable = false}, ref) => {
    return (
      <View style={{paddingHorizontal: 20}}>
        <SignupInput
          ref={ref}
          placeholder="닉네임을 입력해주세요"
          returnKeyType="next"
          state={state}
          getLabel={isFocused =>
            match(state)
              .with(
                undefined,
                () => '닉네임은 영어, 한글, 숫자만 사용 가능해요.',
              )
              .with('VALID', () =>
                match(isFocused)
                  .with(true, () => '사용 가능한 닉네임입니다.')
                  .otherwise(() => `'<b>${value}</b>' 크러셔님 안녕하세요!`),
              )
              .with('PROGRESS', () => '닉네임 확인 중...')
              .with({errorMessage: Pattern.string}, error => error.errorMessage)
              .exhaustive()
          }
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          isClearable={isClearable}
        />
      </View>
    );
  },
);

UserNicknameForm.displayName = 'UserNicknameForm';

export default UserNicknameForm;
