import React from 'react';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import useNavigation from '@/navigation/useNavigation';

/** 각 input 섹션 타이틀 (존댓말, 18px SemiBold gray80v2) */
export const SubLabel = styled.Text`
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  font-family: ${font.pretendardSemibold};
  color: ${color.gray80v2};
`;

/** 사진 설명 등 보조 디스크립션 */
export const Description = styled.Text`
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray45};
`;

/** 섹션 내부에서 라벨-입력(-가이드링크) 한 묶음을 감싸는 래퍼. gap 16 */
export const FormGroup = styled.View`
  gap: 16px;
`;

/** 각 카테고리 섹션의 최상위 컨테이너. 그룹 간 gap 48 */
export const SectionRoot = styled.View`
  gap: 48px;
`;

interface GuideLinkProps {
  type: 'stair' | 'slope';
  elementName: string;
}

const GUIDE_CONFIG: Record<
  GuideLinkProps['type'],
  {title: string; url: string; label: string}
> = {
  stair: {
    title: '계단 기준 알아보기',
    url: 'https://agnica.notion.site/8312cc653a8f4b9aa8bc920bbd668218',
    label: '계단 기준 알아보기 >',
  },
  slope: {
    title: '경사로 기준 알아보기',
    url: 'https://agnica.notion.site/6f64035a062f41e28745faa4e7bd0770',
    label: '경사로 기준 알아보기 >',
  },
};

export function GuideLink({type, elementName}: GuideLinkProps) {
  const navigation = useNavigation();
  const config = GUIDE_CONFIG[type];

  return (
    <GuideLinkContainer>
      <SccPressable
        elementName={elementName}
        onPress={() =>
          navigation.navigate('Webview', {
            fixedTitle: config.title,
            url: config.url,
          })
        }>
        <GuideLinkText>{config.label}</GuideLinkText>
      </SccPressable>
    </GuideLinkContainer>
  );
}

const GuideLinkContainer = styled.View`
  align-items: flex-end;
`;

const GuideLinkText = styled.Text`
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  font-family: ${font.pretendardMedium};
  color: ${color.brand40};
`;
