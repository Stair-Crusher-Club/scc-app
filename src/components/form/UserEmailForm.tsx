import React, {forwardRef} from 'react';
import {View, TextInput} from 'react-native';
import {match, Pattern} from 'ts-pattern';

import SignupInput from '@/screens/SignupScreen/components/SignupInput';
import {UserFormState} from '@/screens/SignupScreen/hooks/useUpdateUser';

interface UserEmailFormProps {
  value: string;
  state: UserFormState['email'];
  onChangeText: (value: string) => Promise<void>;
  onSubmitEditing?: () => void;
  isClearable?: boolean;
}

const UserEmailForm = forwardRef<TextInput, UserEmailFormProps>(
  ({value, state, onChangeText, onSubmitEditing, isClearable = false}, ref) => {
    return (
      <View style={{paddingHorizontal: 20}}>
        <SignupInput
          ref={ref}
          placeholder="이메일을 입력해주세요"
          returnKeyType="next"
          state={state}
          getLabel={isFocused =>
            match(state)
              .with(undefined, () => '이메일을 입력해주세요.')
              .with('VALID', () =>
                match(isFocused)
                  .with(true, () => '사용 가능한 이메일입니다.')
                  .otherwise(() => '뉴스레터, 공지 등을 전달받아요.'),
              )
              .with('PROGRESS', () => '이메일 확인 중...')
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

UserEmailForm.displayName = 'UserEmailForm';

export default UserEmailForm;
