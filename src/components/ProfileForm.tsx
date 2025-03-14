import React from 'react';
import {Controller, FormProvider, UseFormReturn} from 'react-hook-form';

import TextInputWithLabel from '@/components/form/TextInputWithLabel';
import {EMAIL_ADDRESS} from '@/constant/regex';
import {UserMobilityToolDto} from '@/generated-sources/openapi';

import * as S from './ProfileForm.style';
import MultiSelect from './form/MultiSelect';
import Options from './form/Options';

export interface ProfileFormValues {
  nickname: string;
  email: string;
  mobility: UserMobilityToolDto[];
  isNewsLetterSubscriptionAgreed: boolean;
}

interface Props {
  form: UseFormReturn<ProfileFormValues>;
  forSignup?: boolean;
}
export default function ProfileForm({form, forSignup}: Props) {
  return (
    <FormProvider {...form}>
      <Controller
        name="nickname"
        control={form.control}
        render={({field, formState}) => (
          <TextInputWithLabel
            label="정복자 닉네임"
            placeholder="예시: 파란자두"
            optional="required"
            value={field.value}
            onChangeText={field.onChange}
            errorMessage={formState.errors.nickname?.message}
          />
        )}
      />
      <S.Gap />
      <Controller
        name="email"
        control={form.control}
        rules={{
          pattern: {
            value: EMAIL_ADDRESS,
            message: '올바른 이메일 형식을 입력해 주세요.',
          },
        }}
        render={({field, formState}) => (
          <TextInputWithLabel
            label="이메일 주소"
            placeholder="예시: scc@staircrusher.club"
            optional="required"
            value={field.value}
            onChangeText={field.onChange}
            errorMessage={formState.errors.email?.message}
          />
        )}
      />
      <S.Gap />
      <Controller
        name="mobility"
        render={({field}) => (
          <MultiSelect
            label="일상 이동 수단"
            optional="required"
            values={field.value}
            options={[
              {value: 'MANUAL_WHEELCHAIR', label: '수동휠체어'},
              {value: 'MANUAL_AND_ELECTRIC_WHEELCHAIR', label: '수전동휠체어'},
              {value: 'ELECTRIC_WHEELCHAIR', label: '전동휠체어'},
              {
                value: 'PROSTHETIC_FOOT',
                label: '의족',
              },
              {value: 'STROLLER', label: '유아차 동반'},
              {value: 'CLUCH', label: '클러치(목발, 지팡이 등)'},
              {value: 'WALKING_ASSISTANCE_DEVICE', label: '보행차'},
              {value: 'NONE', label: '해당사항 없음'},
            ]}
            onSelect={field.onChange}
          />
        )}
      />
      {forSignup && (
        <>
          <S.Gap />
          <S.Label>
            계단뿌셔클럽의 비하인드, 인사이트를 정기적으로 받아보시겠어요?
          </S.Label>
          <Controller
            name="isNewsLetterSubscriptionAgreed"
            control={form.control}
            render={({field}) => (
              <Options
                options={[
                  {label: '아니요', value: false},
                  {label: '받아볼래요', value: true},
                ]}
                value={field.value}
                onSelect={field.onChange}
              />
            )}
          />
        </>
      )}
    </FormProvider>
  );
}
