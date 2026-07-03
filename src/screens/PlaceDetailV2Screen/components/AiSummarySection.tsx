import React, {useState} from 'react';
import styled from 'styled-components/native';

import CircleInfoIcon from '@/assets/icon/ic_circle_info.svg';
import CloseIcon from '@/assets/icon/close.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AiSummarySourceTabDto,
  PlaceAiSummaryDto,
} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';

/** PDP 최상단 "AI 접근성 요약" 섹션. 서버가 조립한 문장 리스트를 그대로 렌더하는 dumb 컴포넌트. */
export default function AiSummarySection({
  aiSummary,
  onPressSourceTab,
}: {
  aiSummary: PlaceAiSummaryDto | undefined;
  onPressSourceTab: (sourceTab: AiSummarySourceTabDto) => void;
}) {
  const [showNotice, setShowNotice] = useState(false);

  if (!aiSummary || aiSummary.items.length === 0) {
    return null;
  }

  return (
    <LogParamsProvider params={{displaySectionName: 'ai_summary'}}>
      <Container>
        <Header>
          <TitleText>AI 접근성 요약</TitleText>
          {aiSummary.isExperimental && (
            <SccPressable
              elementName="ai_summary_info_icon"
              onPress={() => setShowNotice(prev => !prev)}
              hitSlop={8}>
              <CircleInfoIcon width={16} height={16} />
            </SccPressable>
          )}
        </Header>
        {showNotice && (
          <NoticeRow>
            <NoticeText>
              등록된 외부 접근성 정보와 방문 리뷰를 바탕으로 AI가 요약한
              내용입니다. 실험 단계로 정확하지 않을 수 있어요.
            </NoticeText>
            <SccPressable
              elementName="ai_summary_notice_close"
              onPress={() => setShowNotice(false)}
              hitSlop={8}>
              <CloseIcon width={12} height={12} />
            </SccPressable>
          </NoticeRow>
        )}
        {aiSummary.items.map((item, index) => {
          const sourceTab = item.sourceTab;
          return (
            <ItemRow key={index}>
              <Bullet>{'•'}</Bullet>
              <ItemContent>
                <SummaryText>{item.text}</SummaryText>
                {sourceTab && (
                  <SccPressable
                    elementName="ai_summary_source_badge"
                    logParams={{sourceTab, index}}
                    onPress={() => onPressSourceTab(sourceTab)}
                    hitSlop={4}>
                    <SourceBadge>
                      <SourceBadgeText>{index + 1}</SourceBadgeText>
                    </SourceBadge>
                  </SccPressable>
                )}
              </ItemContent>
            </ItemRow>
          );
        })}
      </Container>
    </LogParamsProvider>
  );
}

// ponytail: Figma 타이틀은 blue→purple 그라디언트 텍스트지만, RN 텍스트 그라디언트는
// MaskedView/SVG 추가 구현이 필요해 v1에서는 근사 단색(blue50)으로 대체. 필요 시 업그레이드.
const Container = styled.View`
  background-color: ${color.gray5};
  border-radius: 5px;
  padding: 10px 8px;
  gap: 6px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding-left: 6px;
`;

const TitleText = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.26px;
  color: ${color.blue50};
`;

const NoticeRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  background-color: ${color.white};
  border-radius: 4px;
`;

const NoticeText = styled.Text`
  flex: 1;
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 18px;
  color: ${color.gray70v2};
`;

const ItemRow = styled.View`
  flex-direction: row;
  padding-left: 8px;
`;

const Bullet = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 15px;
  line-height: 24px;
  color: ${color.gray70v2};
  width: 14px;
`;

const ItemContent = styled.View`
  flex: 1;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
`;

const SummaryText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 15px;
  line-height: 24px;
  letter-spacing: -0.3px;
  color: ${color.gray70v2};
`;

const SourceBadge = styled.View`
  width: 16px;
  height: 16px;
  border-radius: 8px;
  background-color: ${color.gray25};
  align-items: center;
  justify-content: center;
`;

const SourceBadgeText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 11px;
  line-height: 14px;
  color: ${color.gray70v2};
`;
