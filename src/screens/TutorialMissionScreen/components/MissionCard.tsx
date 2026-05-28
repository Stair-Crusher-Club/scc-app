import {BlurView} from '@sbaiahmed1/react-native-blur';
import React from 'react';
import {Image, Platform, View} from 'react-native';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {TutorialMissionTypeDto} from '@/generated-sources/openapi';

import {MissionMeta} from '../constants';

interface MissionCardProps {
  missionType: TutorialMissionTypeDto;
  /** 1, 2, 3 — 번호 뱃지에 표시. */
  missionIndex: number;
  meta: MissionMeta;
  isCompleted: boolean;
  /**
   * 현재 진행 가능한(다음에 깰) 미션. 박원 figma 시안에서는 active 카드에만 2.5px #3590FF
   * 푸른 강조 border + drop-shadow 가 적용된다. 잠긴 미션/완료 미션에는 적용 X.
   */
  isCurrent: boolean;
  /** 이전 미션 미완료로 잠긴 상태. 어두운 backdrop blur + lock overlay 노출. */
  isDimmed: boolean;
  /** 잠긴 미션에 노출할 안내 텍스트. */
  dimText?: string;
  onStart: () => void;
  /**
   * 완료된 미션에 노출되는 보조 링크 (figma quest_card_dim). 예) "관심 지역, 관심 주제
   * 수정하기 →", "저장리스트 다시 보기 →". 미션 3 같이 후속 액션이 없는 미션은 미지정.
   */
  postCompletionLinkText?: string;
  onPostCompletionLinkPress?: () => void;
}

export default function MissionCard({
  missionType,
  missionIndex,
  meta,
  isCompleted,
  isCurrent,
  isDimmed,
  dimText,
  onStart,
  postCompletionLinkText,
  onPostCompletionLinkPress,
}: MissionCardProps) {
  return (
    <CardContainer active={isCurrent}>
      <CardContentWrapper completed={isCompleted}>
        <RowTop>
          <LeftSide>
            <NumberBadge>
              <NumberBadgeText>{missionIndex}</NumberBadgeText>
            </NumberBadge>
            <BodyColumn>
              <Subtitle>
                {meta.subtitle}
                <SubtitleBold>{meta.subtitleBoldSuffix}</SubtitleBold>
              </Subtitle>
              <Title>{meta.title}</Title>
            </BodyColumn>
          </LeftSide>
          <ItemBox>
            <ItemImage
              source={meta.itemImage}
              resizeMode="contain"
              style={{width: meta.itemImageWidth, height: meta.itemImageHeight}}
            />
          </ItemBox>
        </RowTop>

        <StartButton
          elementName="tutorial_mission_start_button"
          logParams={{mission_type: missionType}}
          onPress={isCompleted || isDimmed ? undefined : onStart}
          disabled={isCompleted || isDimmed}
          inactive={isCompleted || isDimmed}>
          <StartButtonText>
            {isCompleted ? '미션 완료' : '미션 시작'}
          </StartButtonText>
        </StartButton>
      </CardContentWrapper>

      {isCompleted && (
        // 완료 overlay: bg rgba(255,255,255,0.7), backdrop-blur 0 (= 단순 흰색 알파).
        // BlurView 안 써도 시각적으로 동일.
        <CompletedOverlay>
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <CompletedInner>
              <CompletedIcon
                source={require('@/assets/img/tutorial/mission_clear_check.png')}
              />
              <CompletedText>미션 클리어!</CompletedText>
            </CompletedInner>
            {postCompletionLinkText && (
              <CompletedLinkPressable
                elementName="tutorial_mission_post_completion_link"
                logParams={{mission_type: missionType}}
                onPress={onPostCompletionLinkPress}>
                <CompletedLinkText>{postCompletionLinkText}</CompletedLinkText>
              </CompletedLinkPressable>
            )}
          </View>
        </CompletedOverlay>
      )}

      {isDimmed && (
        // 잠금 overlay: bg rgba(0,0,0,0.7) + backdrop-blur 5.5px + 1.5px #BCC69B border
        // iOS BlurView blurAmount 0-100, Android 0-32 라 같은 숫자 다른 강도. iOS 35 / Android 6 으로 통일.
        <LockedOverlay
          blurType={Platform.OS === 'ios' ? 'dark' : 'dark'}
          blurAmount={Platform.OS === 'ios' ? 25 : 6}
          reducedTransparencyFallbackColor="rgba(0,0,0,0.7)">
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <LockIcon
              source={require('@/assets/img/tutorial/mission_locked_lock.png')}
            />
            <DimText>{dimText ?? '이전 미션을 먼저 완료해주세요!'}</DimText>
          </View>
        </LockedOverlay>
      )}
    </CardContainer>
  );
}

// active=true 면 2.5px #3590FF border + drop-shadow (figma quest_card_1).
// active=false 면 border 없음, drop-shadow 없음 (잠금/완료 카드).
const CardContainer = styled.View<{active: boolean}>`
  background-color: ${color.white};
  border-radius: 8px;
  ${({active}) =>
    active
      ? `
    border-width: 2.5px;
    border-color: #3590ff;
    shadow-color: #000;
    shadow-offset: 0px 0px;
    shadow-opacity: 0.5;
    shadow-radius: 2px;
    elevation: 3;
  `
      : ''}
  overflow: visible;
`;

// completed 시 본문 opacity 50 (figma 의 quest_card_dim 안의 내부 row 가 opacity 50).
// overflow:hidden 으로 자식 overlay 가 카드 밖으로 튀지 않게.
const CardContentWrapper = styled.View<{completed: boolean}>`
  border-radius: 8px;
  padding: 14px 16px;
  gap: 12px;
  overflow: hidden;
  ${({completed}) => (completed ? 'opacity: 0.5;' : '')}
`;

const RowTop = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const LeftSide = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 4px;
  flex: 1;
  margin-right: 12px;
`;

// figma 1990:14520: bg #D6EBFF, w 22 (min), px 8 py 2, rounded 100.
const NumberBadge = styled.View`
  background-color: #d6ebff;
  border-radius: 100px;
  min-width: 22px;
  padding: 2px 8px;
  align-items: center;
  justify-content: center;
`;

const NumberBadgeText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.26px;
  color: #0c76f7;
`;

const BodyColumn = styled.View`
  flex: 1;
  flex-direction: column;
  gap: 4px;
`;

const Subtitle = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 15px;
  line-height: 22px;
  letter-spacing: -0.3px;
  color: #0e64d3;
`;

const SubtitleBold = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 15px;
  line-height: 22px;
  letter-spacing: -0.3px;
  color: #0e64d3;
`;

const Title = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: #16181c;
`;

// 박원 figma 의 item (1990:14481/1993:15084/2003:15670) 노드를 통째로 PNG export
// 했기 때문에, 박스(#F4F4F4) + rounded 12 + 안의 외출템 아이콘이 모두 baked. 우리
// ItemBox 는 단순 size wrapper. background/border-radius 중복 그리기 X.
const ItemBox = styled.View`
  width: 72px;
  height: 72px;
`;

const ItemImage = styled(Image)``;

// figma 1990:14525: full-width, h 42, bg #0C76F7 (active) / #C3C5CC + opacity 50 (inactive),
// rounded 6, padding 12 5.
const StartButton = styled(SccPressable)<{inactive: boolean}>`
  width: 100%;
  height: 42px;
  border-radius: 6px;
  padding: 5px 12px;
  align-items: center;
  justify-content: center;
  background-color: ${({inactive}) => (inactive ? '#C3C5CC' : '#0C76F7')};
  ${({inactive}) => (inactive ? 'opacity: 0.5;' : '')}
`;

const StartButtonText = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.3px;
  color: ${color.white};
`;

// figma 2003:15280 quest_card_dim 완료 overlay:
// bg rgba(255,255,255,0.7), backdrop-blur 0px. 단순 흰색 알파 View 로 충분.
const CompletedOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  padding: 16px;
`;

const CompletedInner = styled.View`
  align-items: center;
  gap: 2px;
`;

const CompletedIcon = styled(Image)`
  width: 45px;
  height: 45px;
`;

const CompletedText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.black};
  text-align: center;
`;

const CompletedLinkPressable = styled(SccPressable)`
  margin-top: 8px;
  align-items: center;
  justify-content: center;
`;

const CompletedLinkText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: #585a64;
  text-decoration-line: underline;
  text-align: center;
`;

// figma 1993:14903 quest_card_dim 잠금 overlay:
// bg rgba(0,0,0,0.7) + backdrop-blur 5.5px + 1.5px #BCC69B border.
const LockedOverlay = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 8px;
  border-width: 1.5px;
  border-color: #bcc69b;
  background-color: rgba(0, 0, 0, 0.7);
`;

const LockIcon = styled(Image)`
  width: 26px;
  height: 30px;
  margin-bottom: 8px;
`;

const DimText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.white};
  text-align: center;
  padding: 0 16px;
  text-shadow-color: rgba(0, 0, 0, 0.65);
  text-shadow-offset: 0px 0px;
  text-shadow-radius: 4px;
`;
