import React, {forwardRef} from 'react';
import {View} from 'react-native';
import {match, Pattern} from 'ts-pattern';

import SignupBoxInput from '@/screens/SignupScreen/components/SignupBoxInput';
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
      <SignupBoxInput
        label="출생년도"
        isRequired
        placeholder="출생년도를 입력해주세요"
        keyboardType="number-pad"
        maxLength={4}
        state={state}
        caption={match(state)
          .with({errorMessage: Pattern.string}, error => error.errorMessage)
          .otherwise(() => undefined)}
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
