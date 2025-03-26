import React, {forwardRef} from 'react';
import {View, TextInput} from 'react-native';
import styled from 'styled-components/native';
import {match, Pattern} from 'ts-pattern';

import CheckboxSquareIcon from '@/assets/icon/ic_checkbox_square.svg';
import {color} from '@/constant/color';
import SignupInput from '@/screens/SignupScreen/components/SignupInput';
import {UserFormState} from '@/screens/SignupScreen/hooks/useUpdateUser';

interface UserEmailFormProps {
  value: {
    email: string;
    isNewsLetterSubscriptionAgreed: boolean;
  };
  state: Pick<UserFormState, 'email' | 'isNewsLetterSubscriptionAgreed'>;
  onChangeText: (value: string) => Promise<void>;
  onChangeNewsLetterSubscriptionAgreed: (value: boolean) => void;
  onSubmitEditing?: () => void;
  isClearable?: boolean;
}

const UserEmailForm = forwardRef<TextInput, UserEmailFormProps>(
  (
    {
      value,
      state,
      onChangeText,
      onChangeNewsLetterSubscriptionAgreed,
      onSubmitEditing,
      isClearable = false,
    },
    ref,
  ) => {
    return (
      <View style={{paddingHorizontal: 20}}>
        <SignupInput
          ref={ref}
          placeholder="이메일을 입력해주세요"
          returnKeyType="next"
          state={state.email}
          getLabel={isFocused =>
            match(state.email)
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
          value={value.email}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          isClearable={isClearable}
        />
        <LetterBox
          activeOpacity={0.8}
          onPress={() =>
            onChangeNewsLetterSubscriptionAgreed(
              !value.isNewsLetterSubscriptionAgreed,
            )
          }>
          <CheckboxSquareIcon
            color={
              value.isNewsLetterSubscriptionAgreed
                ? color.brandColor
                : color.gray50
            }
            width={20}
            height={20}
          />
          <LetterText>계단뿌셔클럽의 뉴스레터를 받아보시겠습니까?</LetterText>
        </LetterBox>
      </View>
    );
  },
);

UserEmailForm.displayName = 'UserEmailForm';

const LetterBox = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const LetterText = styled.Text`
  font-size: 14px;
  color: ${color.gray100};
`;

export default UserEmailForm;
