import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ListChallengesItemDto} from '@/generated-sources/openapi';

export function MyChallengeBadge() {
  return (
    <Badge style={{backgroundColor: color.brand20}}>
      <BadgeText style={{color: color.white}}>나의 챌린지</BadgeText>
    </Badge>
  );
}

export function ChallengeStatusBadge({
  status,
}: {
  status: ListChallengesItemDto['status'];
}) {
  switch (status) {
    case 'InProgress':
      return (
        <Badge style={{backgroundColor: color.brand10}}>
          <BadgeText style={{color: color.brandColor}}>진행 중</BadgeText>
        </Badge>
      );
    case 'Upcoming':
      return (
        <Badge style={{backgroundColor: color.success10}}>
          <BadgeText style={{color: color.success30}}>오픈 예정</BadgeText>
        </Badge>
      );
    case 'Closed':
      return (
        <Badge>
          <BadgeText style={{color: color.gray80}}>종료된 챌린지</BadgeText>
        </Badge>
      );
    default:
      return null;
  }
}

const Badge = styled.View({
  paddingVertical: 4,
  paddingHorizontal: 6,
  backgroundColor: color.gray20,
  borderRadius: 10,
});

const BadgeText = styled.Text({
  fontFamily: font.pretendardRegular,
  fontSize: 12,
  lineHeight: '19px',
});
