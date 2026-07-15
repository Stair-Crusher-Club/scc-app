import React, {useState} from 'react';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import styled from 'styled-components/native';

import CircleInfoIcon from '@/assets/icon/ic_circle_info_gradient.svg';
import CloseIcon from '@/assets/icon/close.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AiSummarySourceTabDto,
  PlaceAiSummaryDto,
} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';

const TITLE = 'AI 접근성 요약';
const TITLE_LINE_HEIGHT = 18;
const SUMMARY_LINE_HEIGHT = 24;
// 인라인 배지를 텍스트 라인 시각중심에 맞추는 세로 보정(px). 에뮬레이터 실측 캘리브레이션값.
const BADGE_BASELINE_NUDGE_PX = 4;

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

  // 접근성 불릿이 하나라도 있으면 접근성=1/리뷰=2, 접근성 불릿이 없으면(리뷰만) 리뷰=1.
  const hasAccessibilityItem = aiSummary.items.some(
    i => i.sourceTab === AiSummarySourceTabDto.Accessibility,
  );

  return (
    <LogParamsProvider params={{displaySectionName: 'ai_summary'}}>
      <Container>
        <Header>
          <GradientTitle />
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
    </LogParamsProvider>
  );
}

/**
 * "AI 접근성 요약" blue→purple 그라디언트 텍스트 (Figma node 1-324).
 * RN에는 네이티브 gradient text가 없어 react-native-svg 로 그린다. 보이지 않는 측정용 RN
 * <Text>로 폭을 잰 뒤 그 폭으로 Svg를 겹쳐 그린다 — react-native-svg의 Text는 getBBox()로
 * 자기 자신의 렌더폭을 재는 방법이 New Architecture(Android)에서 빈 값만 반환해 동작하지
 * 않는다(실기기 확인: Object.keys(bbox) === [], bbox.width === undefined). 대신 진짜 원인을
 * 고쳤다 — 이전엔 SvgText에 fontFamily(이미 "Pretendard-Bold"로 weight가 이름에 포함된
 * PostScript 이름)와 fontWeight="700"을 동시에 넘겨 Android 폰트 매칭이 실패, 시스템 폴백
 * 폰트로 더 넓게 그려졌다(react-native-svg#1422와 동일 증상). fontWeight를 제거하면 RN
 * <Text>와 SvgText가 동일한 폰트 파일로 동일한 글자를 그리므로 측정폭과 렌더폭이 실제로
 * 일치한다. 혹시 남는 서브픽셀 오차는 SVG 루트가 기본으로 overflow:hidden이라 아이콘을
 * 덮는 대신 마지막 1px만 클리핑되는 안전한 방향으로 실패한다.
 */
function GradientTitle() {
  const [width, setWidth] = useState(0);
  return (
    <TitleWrap>
      <TitleMeasure onLayout={e => setWidth(e.nativeEvent.layout.width)}>
        {TITLE}
      </TitleMeasure>
      {width > 0 && (
        <Svg
          width={width}
          height={TITLE_LINE_HEIGHT}
          style={{position: 'absolute', left: 0, top: 0}}>
          <Defs>
            <SvgLinearGradient
              id="aiSummaryTitleGradient"
              x1="0"
              y1="0"
              x2="1"
              y2="0">
              <Stop offset="0" stopColor="#0089FA" />
              <Stop offset="1" stopColor="#2F28B7" />
            </SvgLinearGradient>
          </Defs>
          <SvgText
            fill="url(#aiSummaryTitleGradient)"
            fontFamily={font.pretendardBold}
            fontSize={13}
            letterSpacing={-0.26}
            x={0}
            y={13.5}>
            {TITLE}
          </SvgText>
        </Svg>
      )}
    </TitleWrap>
  );
}

const Container = styled.View`
  background-color: ${color.gray5};
  border-radius: 5px;
  margin: 0 20px;
  padding: 12px 8px;
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

const TitleWrap = styled.View`
  align-self: flex-start;
`;

// 측정 전용 (그라디언트 Svg 폭 산정). 실제 색은 Svg 가 담당하므로 투명 처리.
const TitleMeasure = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 13px;
  line-height: ${TITLE_LINE_HEIGHT}px;
  letter-spacing: -0.26px;
  opacity: 0;
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
