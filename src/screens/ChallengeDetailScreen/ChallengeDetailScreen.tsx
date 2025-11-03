import {useQuery} from '@tanstack/react-query';
import {isEmpty} from 'lodash';
import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components/native';

import ChallengeStatusBadges from '@/components/ChallengeStatusBadges';
import {ScreenLayout} from '@/components/ScreenLayout';
import {
  JoinChallengeRequestDto,
  JoinChallengeResponseDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import usePost from '@/hooks/usePost';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';

import {SccButton} from '@/components/atoms';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import SccTouchableOpacity from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import * as S from './ChallengeDetailScreen.style';
import ChallengeDetailCompanyModal from './components/ChallengeDetailCompanyModal';
import ChallengeDetailMetrics from './components/ChallengeDetailMetrics';
import ChallengeDetailPasscodeBottomSheet from './components/ChallengeDetailPasscodeBottomSheet';
import ChallengeDetailRankSection from './components/ChallengeDetailRankSection/ChallengeDetailRankSection';
import ChallengeDetailStatus from './components/ChallengeDetailStatus';
import ChallengeDetailStickyActionBar from './components/ChallengeDetailStickyActionBar';
import ChallengeWelcomeModal from './components/ChallengeWelcomeModal';
import LastMonthRankingModal from './components/LastMonthRankingModal';
import {isDismissedToday} from '@/atoms/challengeModalAtoms';

export interface ChallengeDetailScreenParams {
  challengeId: string;
}

const ChallengeDetailScreen = ({
  route,
  navigation,
}: ScreenProps<'ChallengeDetail'>) => {
  const {challengeId} = route.params;

  const {api} = useAppComponents();
  const [showPasscodeBottomSheet, setShowPasscodeBottomSheet] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [passcode, setPasscode] = useState<string>();
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(false);
  const [showLastMonthRankingModal, setShowLastMonthRankingModal] =
    useState(false);

  const {data} = useQuery({
    queryKey: ['ChallengeDetail', challengeId],
    queryFn: async ({queryKey}) =>
      (await api.getChallengePost({challengeId: queryKey[1]})).data,
  });
  const challenge = data?.challenge;
  const ranks = data?.ranks ?? [];
  const myRank = data?.myRank;
  const hasJoined = data?.hasJoined;
  const hasPasscode = data?.hasPasscode ?? false;
  const isB2B = data?.isB2B ?? false;

  const joinChallenge = usePost<
    JoinChallengeRequestDto,
    JoinChallengeResponseDto
  >(['ChallengeDetail', challengeId], async params => {
    const result = await api.joinChallengePost(params);
    return result.data;
  });

  useEffect(() => {
    navigation.setOptions({headerTitle: challenge?.name ?? '계단뿌셔 챌린지'});
  }, [challenge]);

  useEffect(() => {
    // ChallengeWelcomeModal이 표시되어야 하면 LastMonthRankingModal은 표시하지 않음
    const shouldShowWelcomeModal = joinChallenge.isSuccess && isB2B;

    if (
      hasJoined &&
      challenge?.modalImageUrl &&
      !isDismissedToday(challengeId) &&
      !shouldShowWelcomeModal // 한 번에 하나의 모달만 띄운다.
    ) {
      setShowLastMonthRankingModal(true);
    }
  }, [hasJoined, challenge?.modalImageUrl, challengeId]);

  const prevY = useRef(0);
  const [visible, setVisible] = useState(false);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!hasJoined) {
      return;
    }

    const y = e.nativeEvent.contentOffset.y;
    const diff = y - prevY.current;

    if (y <= 0) {
      setVisible(false);
      prevY.current = y;
      return;
    }

    const {layoutMeasurement, contentOffset, contentSize} = e.nativeEvent;

    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 1;

    if (isAtBottom) {
      setVisible(true);
      prevY.current = y;
      return;
    }

    if (Math.abs(diff) < 8) return;
    if (diff > 0) {
      setVisible(true);
    } else {
      setVisible(false);
    }

    prevY.current = y;
  };

  return (
    <LogParamsProvider params={{challenge_id: challengeId}}>
      <ScreenLayout isHeaderVisible={false}>
        <S.Container onScroll={onScroll} scrollEventThrottle={16}>
          <S.Contents>
            <ChallengeStatusBadgesWrapper
              status={[challenge?.status ?? 'Closed']}
              isMyChallenge={hasJoined ?? false}
            />
            <S.Title>{challenge?.name}</S.Title>
            {challenge && (
              <>
                <ChallengeDetailStatus challenge={challenge} />
                <ChallengeDetailMetrics
                  endsAt={challenge.endsAt}
                  numberOfParticipations={challenge.participationsCount}
                  goalOfContributions={challenge.goal}
                  numberOfContributions={challenge.contributionsCount}
                />
                {challenge?.description ? (
                  <DescriptionRenderer
                    description={challenge.description}
                    isCollapsed={isDescriptionCollapsed}
                    onToggleCollapse={() =>
                      setIsDescriptionCollapsed(!isDescriptionCollapsed)
                    }
                  />
                ) : (
                  <S.GuideText>{`${challenge.name} 챌린지에서 ${
                    challenge.goal
                  }개 장소 정복에 도전해보세요!${
                    !isEmpty(challenge.milestones)
                      ? ` 중간목표 ${challenge.milestones[0]}개를 달성하면 콩알이 친구가 도전을 함께 하게 됩니다🤗`
                      : ''
                  }`}</S.GuideText>
                )}
              </>
            )}
            {hasJoined && (
              <ChallengeDetailRankSection
                ranks={ranks}
                myRank={myRank}
                quests={data?.quests}
                lastMonthRankImageUrl={challenge?.lastMonthRankImageUrl}
              />
            )}
          </S.Contents>
        </S.Container>
        {hasJoined === true && (
          <ChallengeDetailStickyActionBar
            visible={visible}
            onGoConquer={() => navigation.navigate('Search', {initKeyword: ''})}
          />
        )}
        {hasJoined === false && (
          <SafeAreaWrapper edges={['bottom']}>
            <S.ButtonContainer>
              <SccButton
                text={'챌린지 참여하기'}
                textColor="white"
                buttonColor="brandColor"
                fontFamily={font.pretendardBold}
                onPress={() => {
                  if (hasPasscode || isB2B) {
                    setShowPasscodeBottomSheet(true);
                  } else {
                    joinChallenge.mutate({challengeId});
                  }
                }}
                elementName="challenge_detail_join"
              />
            </S.ButtonContainer>
          </SafeAreaWrapper>
        )}
        <ChallengeDetailCompanyModal
          isVisible={showCompanyModal}
          onPressCloseButton={() => {
            setShowCompanyModal(false);
            setPasscode(undefined);
          }}
          onPressConfirmButton={companyInfo => {
            setShowCompanyModal(false);
            joinChallenge.mutate({
              challengeId,
              passcode,
              companyInfo,
            });
          }}
          formSchema={challenge?.b2bFormSchema}
        />
        <ChallengeDetailPasscodeBottomSheet
          isVisible={showPasscodeBottomSheet}
          onPressCloseButton={() => {
            setShowPasscodeBottomSheet(false);
          }}
          onPressConfirmButton={_passcode => {
            setShowPasscodeBottomSheet(false);
            if (isB2B) {
              setShowCompanyModal(true);
              setPasscode(_passcode);
              return;
            }
            joinChallenge.mutate({challengeId, passcode: _passcode});
          }}
        />
        <ChallengeWelcomeModal visible={joinChallenge.isSuccess && isB2B} />
        {challenge?.modalImageUrl && (
          <LastMonthRankingModal
            challengeId={challengeId}
            imageUrl={challenge.modalImageUrl}
            visible={showLastMonthRankingModal}
            onClose={() => setShowLastMonthRankingModal(false)}
          />
        )}
      </ScreenLayout>
    </LogParamsProvider>
  );
};

export default ChallengeDetailScreen;

const ChallengeStatusBadgesWrapper = styled(ChallengeStatusBadges)`
  margin: 0 25px 14px 25px;
`;

interface DescriptionRendererProps {
  description: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const DESCRIPTION_COLLAPSE_THRESHOLD = 50;
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/;

const DescriptionRenderer = ({
  description,
  isCollapsed,
  onToggleCollapse,
}: DescriptionRendererProps) => {
  // description을 문단 단위로 분리
  const paragraphs = description.split('\n');
  const lastParagraph = paragraphs[paragraphs.length - 1];

  // 마지막 문단에 링크가 있는지 확인 (Markdown 링크 패턴: [text](url))
  const hasLinkInLastParagraph = MARKDOWN_LINK_REGEX.test(lastParagraph);

  let mainContent: string;
  let linkParagraph: string | null = null;

  if (hasLinkInLastParagraph) {
    // 마지막 문단에 링크가 있으면 분리
    mainContent = paragraphs.slice(0, -1).join('\n');
    linkParagraph = lastParagraph;
  } else {
    // 링크가 없으면 전체를 mainContent로 사용
    mainContent = description;
  }

  // mainContent의 길이를 체크하여 접기/더보기 필요 여부 결정
  const shouldShowToggle = mainContent.length >= DESCRIPTION_COLLAPSE_THRESHOLD;

  const markdownStyle = {
    body: {
      lineHeight: 22,
      fontSize: 14,
      fontFamily: font.pretendardRegular,
    },
    link: {
      color: color.brand60,
      fontSize: 14,
      lineHeight: 22,
      fontFamily: font.pretendardMedium,
    },
  };

  return (
    <S.Description>
      <View>
        <Markdown style={markdownStyle}>
          {isCollapsed && shouldShowToggle
            ? mainContent.substring(0, DESCRIPTION_COLLAPSE_THRESHOLD) + '...'
            : mainContent}
        </Markdown>
        {shouldShowToggle && (
          <SccTouchableOpacity
            elementName="challenge_description_toggle"
            onPress={onToggleCollapse}
            style={{
              alignItems: 'flex-end',
              marginTop: 4,
            }}>
            <Text
              style={{
                color: color.gray40,
                fontSize: 14,
                fontFamily: font.pretendardRegular,
                textDecorationLine: isCollapsed ? 'underline' : 'none',
              }}>
              {isCollapsed ? '더보기' : '접기'}
            </Text>
          </SccTouchableOpacity>
        )}
      </View>
      {linkParagraph && (
        <Markdown style={markdownStyle}>{linkParagraph}</Markdown>
      )}
    </S.Description>
  );
};
