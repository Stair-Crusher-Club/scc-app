import React, {forwardRef} from 'react';
import {View} from 'react-native';
import {match, Pattern} from 'ts-pattern';

import SignupInput from '@/screens/SignupScreen/components/SignupInput';
import {UserFormState} from '@/screens/SignupScreen/hooks/useUpdateUser';

interface UserBirthYearFormProps {
  value: string;
  state: UserFormState['birthYear'];
  onChangeText: (value: string) => Promise<void>;
  onSubmitEditing?: () => void;
}

export interface UserBirthYearFormRef {
  show: () => void;
}

const UserBirthYearForm = forwardRef<
  UserBirthYearFormRef,
  UserBirthYearFormProps
>(({value, state, onChangeText, onSubmitEditing}, _ref) => {
  return (
    <View style={{paddingHorizontal: 20}}>
      <SignupInput
        label="출생년도"
        placeholder="출생년도를 입력해주세요"
        returnKeyType="done"
        keyboardType="number-pad"
        maxLength={4}
        state={state}
        getLabel={() =>
          match(state)
            .with(undefined, () => '숫자로만 4자리 입력해주세요.')
            .with('VALID', () => undefined)
            .with('PROGRESS', () => undefined)
            .with({errorMessage: Pattern.string}, error => error.errorMessage)
            .exhaustive()
        }
        value={value}
        onChangeText={text => {
          const numbersOnly = text.replace(/[^0-9]/g, '');
          onChangeText(numbersOnly);
        }}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
});

UserBirthYearForm.displayName = 'UserBirthYearForm';

export default UserBirthYearForm;
