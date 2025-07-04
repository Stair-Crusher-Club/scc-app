import * as React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  BuildingAccessibilityComment,
  PlaceAccessibilityComment,
} from '@/generated-sources/openapi';

export const CommentBlock = ({
  info,
}: {
  info: PlaceAccessibilityComment | BuildingAccessibilityComment;
}) => {
  const displayedAt = () => {
    const createdAt = new Date(info.createdAt.value);
    const now = new Date();

    const milliSeconds = now.getTime() - createdAt.getTime();
    const seconds = milliSeconds / 1000;
    if (seconds < 60) {
      return '방금 전';
    }
    const minutes = seconds / 60;
    if (minutes < 60) {
      return `${Math.floor(minutes)}분 전`;
    }
    const hours = minutes / 60;
    if (hours < 24) {
      return `${Math.floor(hours)}시간 전`;
    }
    const days = hours / 24;
    if (days < 7) {
      return `${Math.floor(days)}일 전`;
    }
    const weeks = days / 7;
    if (weeks < 5) {
      return `${Math.floor(weeks)}주 전`;
    }
    const months = days / 30;
    if (months < 12) {
      return `${Math.floor(months)}개월 전`;
    }
    const years = days / 365;
    return `${Math.floor(years)}년 전`;
  };

  return (
    <Container>
      <CommenterRow>
        <Commenter>{info.user?.nickname ?? '익명 비밀요원'}</Commenter>
        <CommentedAt>{displayedAt()}</CommentedAt>
      </CommenterRow>
      <CommentContents>{info.comment}</CommentContents>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  flex-direction: column;
  gap: 4px;
  background-color: ${color.gray10};
  border-radius: 12px;
  padding: 12px;
`;

const CommenterRow = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const Commenter = styled.Text`
  font-size: 13px;
  line-height: 18px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray90};
`;

const CommentedAt = styled.Text`
  font-size: 12px;
  line-height: 16px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray40};
`;

const CommentContents = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 16px;
  line-height: 26px;
  color: ${color.gray60};
`;
