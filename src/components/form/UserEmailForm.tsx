import React, {forwardRef} from 'react';
import {TextInput, View} from 'react-native';
import styled from 'styled-components/native';
import {match, Pattern} from 'ts-pattern';

import CheckboxSquareIcon from '@/assets/icon/ic_checkbox_square.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import SignupBoxInput from '@/screens/SignupScreen/components/SignupBoxInput';
import {UserFormState} from '@/screens/SignupScreen/hooks/useUpdateUser';

const TOP_DOMAINS = ['naver.com', 'gmail.com', 'hanmail.net'];
const DOMAIN_PREFIX_MAP: Record<string, string[]> = {
  n: ['naver.com', 'nate.com'],
  g: ['gmail.com'],
  h: ['hanmail.net'],
  k: ['kakao.com'],
  d: ['daum.net'],
};

function getDomainSuggestions(email: string): string[] {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) {
    return [];
  }
  const domainPart = email.slice(atIndex + 1);
  if (domainPart === '') {
    return TOP_DOMAINS;
  }
  const lowerDomain = domainPart.toLowerCase();
  const firstChar = lowerDomain[0];
  const candidates = DOMAIN_PREFIX_MAP[firstChar] ?? [];
  // 이미 완전히 일치하는 도메인은 추천할 필요 없으므로 제외.
  return candidates.filter(
    domain => domain.startsWith(lowerDomain) && domain !== lowerDomain,
  );
}

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
    // focus 여부와 무관하게 입력된 텍스트 기준으로 추천 도메인을 표시한다.
    const suggestions = getDomainSuggestions(value.email);

    const handleSelectDomain = (domain: string) => {
      const atIndex = value.email.indexOf('@');
      const localPart =
        atIndex !== -1 ? value.email.slice(0, atIndex) : value.email;
      onChangeText(`${localPart}@${domain}`);
    };

    return (
      <View style={{paddingHorizontal: 20}}>
        <SignupBoxInput
          ref={ref}
          label="이메일"
          isRequired
          placeholder="이메일을 입력해주세요"
          returnKeyType="next"
          state={state.email}
          caption={
            suggestions.length > 0
              ? undefined
              : match(state.email)
                  .with(
                    {errorMessage: Pattern.string},
                    error => error.errorMessage,
                  )
                  .otherwise(() => undefined)
          }
          value={value.email}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          isClearable={isClearable}
        />
        {suggestions.length > 0 && (
          <ChipRow>
            {suggestions.map(domain => (
              <DomainChip
                key={domain}
                elementName="email_domain_suggestion"
                onPress={() => handleSelectDomain(domain)}>
                <DomainChipText>{domain}</DomainChipText>
              </DomainChip>
            ))}
          </ChipRow>
        )}
        <LetterBox
          elementName="newsletter_subscription_checkbox"
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
                : color.gray25
            }
            width={24}
            height={24}
          />
          <LetterText>계단뿌셔클럽의 뉴스레터를 받아보시겠습니까?</LetterText>
        </LetterBox>
      </View>
    );
  },
);

UserEmailForm.displayName = 'UserEmailForm';

const ChipRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  margin-bottom: 12px;
`;

const DomainChip = styled(SccTouchableOpacity)`
  padding-vertical: 8px;
  padding-horizontal: 14px;
  border-radius: 18px;
  border-width: 1px;
  border-color: ${color.gray20};
  background-color: ${color.white};
`;

const DomainChipText = styled.Text`
  font-size: 14px;
  color: ${color.gray100};
`;

const LetterBox = styled(SccTouchableOpacity)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
`;

const LetterText = styled.Text`
  font-size: 14px;
  color: ${color.gray100};
`;

export default UserEmailForm;
