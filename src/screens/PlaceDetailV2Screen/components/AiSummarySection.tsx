import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';

import CircleInfoIcon from '@/assets/icon/ic_circle_info_gradient.svg';
import ThumbsDownIcon from '@/assets/icon/ic_ai_summary_thumbsdown.svg';
import ThumbsDownFillIcon from '@/assets/icon/ic_ai_summary_thumbsdown_fill.svg';
import ThumbsUpIcon from '@/assets/icon/ic_ai_summary_thumbsup.svg';
import ThumbsUpFillIcon from '@/assets/icon/ic_ai_summary_thumbsup_fill.svg';
import CloseIcon from '@/assets/icon/close.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AiSummarySourceTabDto,
  PlaceAiSummaryDto,
  PlaceAiSummaryVoteDto,
} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';

import {useAiSummaryFeedback} from '../hooks/useAiSummaryFeedback';
import AiSummaryDownvoteBottomSheet from '../modals/AiSummaryDownvoteBottomSheet';

const TITLE = 'AI 접근성 요약';
const TITLE_LINE_HEIGHT = 18;
const SUMMARY_LINE_HEIGHT = 24;
// 인라인 배지를 텍스트 라인 시각중심에 맞추는 세로 보정(px). 에뮬레이터 실측 캘리브레이션값.
const BADGE_BASELINE_NUDGE_PX = 4;

/** PDP 최상단 "AI 접근성 요약" 섹션. 서버가 조립한 문장 리스트를 그대로 렌더하는 dumb 컴포넌트. */
export default function AiSummarySection({
  placeId,
  aiSummary,
  onPressSourceTab,
}: {
  placeId: string;
  aiSummary: PlaceAiSummaryDto | undefined;
  onPressSourceTab: (sourceTab: AiSummarySourceTabDto) => void;
}) {
  const [showNotice, setShowNotice] = useState(false);
  const [isDownvoteSheetVisible, setIsDownvoteSheetVisible] = useState(false);
  const {vote, isPending, giveUpvote, giveDownvote, cancelFeedback} =
    useAiSummaryFeedback(placeId);

  // 노출 여부를 서버 값에서 "한 번만" 떼어낸다. 이후 어떤 refetch가 와도 이 화면 세션에서는 유지된다.
  // (lazy initializer 금지 — 첫 렌더엔 aiSummary가 아직 undefined라 false로 잘못 고정된다.)
  const [showFeedbackButtons, setShowFeedbackButtons] = useState<
    boolean | null
  >(null);
  useEffect(() => {
    if (showFeedbackButtons === null && aiSummary) {
      setShowFeedbackButtons(!aiSummary.isFeedbackGiven);
    }
  }, [aiSummary, showFeedbackButtons]);

  if (!aiSummary || aiSummary.items.length === 0) {
    return null;
  }

  // 접근성 불릿이 하나라도 있으면 접근성=1/리뷰=2, 접근성 불릿이 없으면(리뷰만) 리뷰=1.
  const hasAccessibilityItem = aiSummary.items.some(
    i => i.sourceTab === AiSummarySourceTabDto.Accessibility,
  );

  return (
    <LogParamsProvider params={{displaySectionName: 'ai_summary'}}>
      <Container>
        <Header>
          <TitleText>{TITLE}</TitleText>
          {aiSummary.isExperimental && (
            <SccPressable
              elementName="ai_summary_info_icon"
              onPress={() => setShowNotice(prev => !prev)}
              hitSlop={8}>
              <CircleInfoIcon width={16} height={16} />
            </SccPressable>
          )}
        </Header>
        <ItemContainer>
          {aiSummary.items.map((item, index) => {
            const sourceTab = item.sourceTab;
            const sourceBadgeNumber =
              sourceTab === AiSummarySourceTabDto.Accessibility
                ? 1
                : hasAccessibilityItem
                  ? 2
                  : 1;
            return (
              <ItemRow key={index}>
                <Bullet>{'•'}</Bullet>
                {/* 배지를 SummaryText(<Text>) 안 인라인 자식으로 넣는다 (RN은 <Text> 안에
                    고정 크기 <View>를 넣으면 인라인으로 렌더됨). 텍스트가 여러 줄로 감겨도
                    마지막 글자 바로 다음에 배지가 이어진다 (별도 우측 컬럼 X). */}
                <SummaryText>
                  {item.text}
                  {sourceTab ? '  ' : ''}
                  {sourceTab && (
                    <SccPressable
                      elementName="ai_summary_source_badge"
                      logParams={{sourceTab, index}}
                      onPress={() => onPressSourceTab(sourceTab)}
                      hitSlop={4}>
                      <BadgeInline>
                        <Badge>
                          <SourceBadgeText>{sourceBadgeNumber}</SourceBadgeText>
                        </Badge>
                      </BadgeInline>
                    </SccPressable>
                  )}
                </SummaryText>
              </ItemRow>
            );
          })}
        </ItemContainer>
        {/* 버튼 행만 조건부로 추가하고 카드 높이는 콘텐츠에 맡긴다 (고정 금지). 우하단 배치는
            이 행이 카드의 마지막 자식이면서 내부에서 flex-end로 정렬되는 것으로 달성한다. */}
        {showFeedbackButtons && (
          <FeedbackButtonRow>
            <FeedbackButton
              elementName="ai_summary_thumbs_down"
              logParams={{
                action: vote === PlaceAiSummaryVoteDto.Down ? 'cancel' : 'vote',
              }}
              onPress={() =>
                vote === PlaceAiSummaryVoteDto.Down
                  ? cancelFeedback()
                  : setIsDownvoteSheetVisible(true)
              }
              disabled={isPending}
              hitSlop={4}
              accessibilityRole="button"
              // 아이콘만 있는 버튼이라 스크린리더에 읽을 텍스트가 없다. elementName 은 로깅용이라 안 읽힌다.
              accessibilityLabel={
                vote === PlaceAiSummaryVoteDto.Down
                  ? 'AI 요약이 아쉬워요, 선택됨. 누르면 취소합니다'
                  : 'AI 요약이 아쉬워요'
              }
              accessibilityState={{
                selected: vote === PlaceAiSummaryVoteDto.Down,
                disabled: isPending,
              }}>
              {vote === PlaceAiSummaryVoteDto.Down ? (
                <ThumbsDownFillIcon width={16} height={16} />
              ) : (
                <ThumbsDownIcon width={16} height={16} />
              )}
            </FeedbackButton>
            <FeedbackButton
              elementName="ai_summary_thumbs_up"
              logParams={{
                action: vote === PlaceAiSummaryVoteDto.Up ? 'cancel' : 'vote',
              }}
              onPress={() =>
                vote === PlaceAiSummaryVoteDto.Up
                  ? cancelFeedback()
                  : giveUpvote()
              }
              disabled={isPending}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={
                vote === PlaceAiSummaryVoteDto.Up
                  ? 'AI 요약이 도움돼요, 선택됨. 누르면 취소합니다'
                  : 'AI 요약이 도움돼요'
              }
              accessibilityState={{
                selected: vote === PlaceAiSummaryVoteDto.Up,
                disabled: isPending,
              }}>
              {vote === PlaceAiSummaryVoteDto.Up ? (
                <ThumbsUpFillIcon width={16} height={16} />
              ) : (
                <ThumbsUpIcon width={16} height={16} />
              )}
            </FeedbackButton>
          </FeedbackButtonRow>
        )}
        {/* 다른 레이아웃을 밀어내지 않도록 absolute 오버레이로 띄운다 (Figma node 1-650). */}
        {showNotice && (
          <NoticeRow>
            <NoticeText>
              등록된 외부 접근성 정보와 방문 리뷰를 바탕으로 AI가 요약한
              내용입니다. 실험 단계로 정확하지 않을 수 있어요.
            </NoticeText>
            {/* NoticeText 첫 줄(line-height 16px) 세로 중앙에 X를 맞춘다. NoticeRow는
                align-items: flex-start를 유지하고, 이 슬롯만 16px 높이로 감싸 중앙 정렬. */}
            <CloseButtonSlot>
              <SccPressable
                elementName="ai_summary_notice_close"
                onPress={() => setShowNotice(false)}
                hitSlop={8}>
                <CloseIcon width={8.17} height={8.17} />
              </SccPressable>
            </CloseButtonSlot>
          </NoticeRow>
        )}
      </Container>
      <AiSummaryDownvoteBottomSheet
        isVisible={isDownvoteSheetVisible}
        isPending={isPending}
        onPressClose={() => setIsDownvoteSheetVisible(false)}
        onSubmit={async params => {
          // mutateAsync 성공 후에만 시트를 닫는다. 실패 시 giveDownvote가 던지는 에러가
          // 여기서도 던져지므로, 시트는 이 catch를 만나지 않고 계속 열린 채로 남는다.
          await giveDownvote(params);
          setIsDownvoteSheetVisible(false);
        }}
      />
    </LogParamsProvider>
  );
}

const Container = styled.View`
  background-color: ${color.gray5};
  border-radius: 5px;
  margin: 0 20px;
  padding: 14px;
  gap: 6px;
  position: relative;
  overflow: visible;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 2px;
  padding-left: 6px;
`;

// PDP "AI 접근성 요약" 제목. 단색 RN <Text> — 레이아웃폭=렌더폭이라 뒤따르는 info 아이콘과
// 폰트/폴백에 상관없이 절대 겹치거나 잘리지 않는다. (과거 SVG 그라디언트 오버레이는 measure
// 폭 vs SVG 렌더 폭 불일치로 클리핑/겹침 발생 — textLength/getBBox 모두 New Arch 미동작이라
// SVG로는 근본 해결 불가. 그라디언트가 필요하면 MaskedView 도입 후 네이티브 릴리스로 복원.)
const TitleText = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 13px;
  line-height: ${TITLE_LINE_HEIGHT}px;
  letter-spacing: -0.26px;
  color: #0089fa;
`;

// 헤더 바로 아래에 다른 콘텐츠를 가리는 absolute 오버레이 (Figma node 1-650).
// top: 34px = Container padding-top(10) + Header height(18) + gap(6).
const NoticeRow = styled.View`
  position: absolute;
  top: 34px;
  left: 8px;
  right: 8px;
  z-index: 10;
  elevation: 6;
  flex-direction: row;
  align-items: flex-start;
  gap: 4px;
  padding: 8px;
  background-color: ${color.white};
  border-radius: 6px;
  border-width: 1px;
  border-color: #0089fa;
  shadow-color: #000;
  shadow-offset: 0px 0px;
  shadow-opacity: 0.2;
  shadow-radius: 16px;
`;

const NoticeText = styled.Text`
  flex: 1;
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.gray70v2};
`;

// NoticeText 첫 줄 높이(line-height 16px)와 동일하게 잡아 닫기 X를 세로 중앙 정렬한다.
const CloseButtonSlot = styled.View`
  height: 16px;
  justify-content: center;
`;

const ItemContainer = styled.View``;

const ItemRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  padding-left: 8px;
`;

const Bullet = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 15px;
  line-height: 24px;
  color: ${color.gray70v2};
  width: 14px;
`;

const SummaryText = styled.Text`
  flex: 1;
  font-family: ${font.pretendardRegular};
  font-size: 15px;
  line-height: ${SUMMARY_LINE_HEIGHT}px;
  letter-spacing: -0.3px;
  color: ${color.gray70v2};
`;

// SummaryText(<Text>) 안 인라인 자식. RN(Android)은 인라인 View의 바닥을 텍스트 baseline에
// 붙이므로, 16px 배지 중심이 텍스트 시각중심에 오도록 translateY로 보정한다(라인 정렬은 자식
// 렌더 엔진 특성이라 이론값이 불안정 → 에뮬레이터 실측 캘리브레이션).
// ponytail: BADGE_BASELINE_NUDGE_PX는 15px/line-height 24px 기준 실측값. 폰트/라인높이 바뀌면 재측정.
const BadgeInline = styled.View`
  transform: translateY(${BADGE_BASELINE_NUDGE_PX}px);
`;

// 16x16 원형 배지 (실제 시각 요소).
const Badge = styled.View`
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

// 54x24 그룹을 카드 우하단에 붙인다. 두 버튼(24px) + gap(6px)이 정확히 54px을 이룬다.
const FeedbackButtonRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  gap: 6px;
`;

// 선택 여부와 무관하게 배경은 항상 동일 — 아이콘만 outline/fill로 바뀐다.
const FeedbackButton = styled(SccPressable)`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${color.gray20v2};
  align-items: center;
  justify-content: center;
`;
