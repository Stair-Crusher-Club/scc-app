import React, {forwardRef, useImperativeHandle} from 'react';
import {View} from 'react-native';
import {match, Pattern} from 'ts-pattern';

import BottomSheet from '@/modals/BottomSheet';
import BirthYearSelector from '@/screens/SignupScreen/components/BirthYearSelector';
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
>(({value, state, onChangeText, onSubmitEditing}, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);

  useImperativeHandle(ref, () => ({
    show: () => setIsOpen(true),
  }));

  return (
    <>
      <View style={{paddingHorizontal: 20}}>
        <SignupInput
          placeholder="태어난 해를 알려주세요"
          returnKeyType="done"
          state={state}
          onPress={() => setIsOpen(true)}
          getLabel={() =>
            match(state)
              .with(undefined, () => undefined)
              .with('VALID', () => undefined)
              .with('PROGRESS', () => undefined)
              .with({errorMessage: Pattern.string}, error => error.errorMessage)
              .exhaustive()
          }
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
        />
      </View>
      <BottomSheet
        isVisible={isOpen}
        onPressBackground={() => setIsOpen(false)}>
        <BirthYearSelector
          value={value}
          onChange={onChangeText}
          onClose={() => setIsOpen(false)}
        />
      </BottomSheet>
    </>
  );
});

UserBirthYearForm.displayName = 'UserBirthYearForm';

export default UserBirthYearForm;
