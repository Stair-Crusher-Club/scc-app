import React from 'react';
import {Controller} from 'react-hook-form';

import TextArea from '@/components/form/TextArea';

import {Platform} from 'react-native';
import * as S from './CommentsSection.style';

export default function CommentsSection() {
  return (
    <S.CommentsSection>
      <S.Header>
        <S.SectionTitle>의견 추가</S.SectionTitle>
      </S.Header>
      <S.Description>
        더 도움이 될 정보가 있다면 남겨 주세요! <S.Optional>(선택)</S.Optional>
      </S.Description>
      <Controller
        name="comment"
        render={({field}) => (
          <TextArea
            placeholder="예시) 후문에는 계단이 없어 편하게 갈 수 있습니다 (최대 100자)"
            value={field.value}
            onChangeText={field.onChange}
            style={{
              minHeight: Platform.OS === 'android' ? 50 : undefined,
            }}
          />
        )}
      />
    </S.CommentsSection>
  );
}
