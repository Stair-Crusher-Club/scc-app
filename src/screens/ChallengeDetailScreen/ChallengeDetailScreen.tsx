import {useQuery} from '@tanstack/react-query';
import {isEmpty} from 'lodash';
import React, {useEffect, useRef, useState} from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';

import IcCalendar from '@/assets/icon/ic_calendar.svg';
import IcParticipants from '@/assets/icon/ic_participants.svg';
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

import {isDismissedToday} from '@/atoms/challengeModalAtoms';
import {SccButton} from '@/components/atoms';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import SccTouchableOpacity from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ChallengeDateFormat} from '@/utils/ChallengeDateFormat';
import {useCheckAuth} from '@/utils/checkAuth';
import {cn} from '@/utils/cn';

import ChallengeDetailCompanyModal from './components/ChallengeDetailCompanyModal';
import ChallengeDetailPasscodeBottomSheet from './components/ChallengeDetailPasscodeBottomSheet';
import ChallengeDetailRankSection from './components/ChallengeDetailRankSection/ChallengeDetailRankSection';
import ChallengeDetailStatus from './components/ChallengeDetailStatus';
import ChallengeDetailStickyActionBar from './components/ChallengeDetailStickyActionBar';
import ChallengeWelcomeModal from './components/ChallengeWelcomeModal';
import LastMonthRankingModal from './components/LastMonthRankingModal';

export interface ChallengeDetailScreenParams {
  challengeId: string;
  /** 딥링크 query param autoJoin=true → 자동 참여 */
  autoJoin?: string;
  /** 딥링크 query param passcode=XXX → 자동 참여 시 passcode */
  passcode?: string;
}

const ChallengeDetailScreen = ({
  route,
  navigation,
}: ScreenProps<'ChallengeDetail'>) => {
  const {challengeId, autoJoin, passcode: initialPasscode} = route.params;
  const shouldAutoJoin = autoJoin === 'true';
  const checkAuth = useCheckAuth();

  const {api} = useAppComponents();
  const [showPasscodeBottomSheet, setShowPasscodeBottomSheet] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [passcode, setPasscode] = useState<string | undefined>(initialPasscode);
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

  // 챌린지명이 아니라 '챌린지' 고정 (시안 반영, 24:5368)
  useEffect(() => {
    navigation.setOptions({headerTitle: '챌린지'});
  }, [navigation]);

  // 딥링크 autoJoin=true → 자동 참여 처리
  const autoJoinHandled = useRef(false);
  useEffect(() => {
    if (!shouldAutoJoin || autoJoinHandled.current) {
      return;
    }
    if (hasJoined === undefined || !data) {
      return; // 아직 데이터 로딩 중
    }
    if (hasJoined) {
      return; // 이미 참여한 챌린지
    }
    checkAuth(() => {
      autoJoinHandled.current = true;
      if (isB2B) {
        setShowCompanyModal(true);
        return;
      }
      joinChallenge.mutate({
        challengeId,
        passcode: initialPasscode,
      });
    });
  }, [
    shouldAutoJoin,
    hasJoined,
    data,
    isB2B,
    challengeId,
    checkAuth,
    initialPasscode,
  ]);

  // 새 환영팝업(welcomePopup 지정) 또는 B2B 기존팝업 중 하나라도 뜰 조건이면
  // LastMonthRankingModal은 표시하지 않는다(한 번에 하나만).
  const shouldShowWelcomeModal =
    joinChallenge.isSuccess && (challenge?.welcomePopup != null || isB2B);

  useEffect(() => {
    if (
      hasJoined &&
      challenge?.modalImageUrl &&
      !isDismissedToday(challengeId) &&
      !shouldShowWelcomeModal // 한 번에 하나의 모달만 띄운다.
    ) {
      setShowLastMonthRankingModal(true);
    }
  }, [
    hasJoined,
    challenge?.modalImageUrl,
    challengeId,
    shouldShowWelcomeModal,
  ]);

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

  // ctpl 챌린지는 '남은 매장 보기'가 sticky CTA 역할을 대신하므로 그만큼 노출 조건을 좁힌다.
  const shouldShowStickyActionBar =
    hasJoined === true &&
    challenge?.status !== 'Closed' &&
    !challenge?.hasConquerTargetPlaceList;

  return (
    <LogParamsProvider params={{challenge_id: challengeId}}>
      <ScreenLayout isHeaderVisible={false}>
        <ScrollView
          className="bg-white"
          onScroll={onScroll}
          scrollEventThrottle={16}>
          <View className="pl-[25px] pr-[20px] pt-[20px] pb-[8px] gap-[8px]">
            <View className="gap-[4px]">
              <ChallengeStatusBadges
                status={[challenge?.status ?? 'Closed']}
                isMyChallenge={hasJoined ?? false}
              />
              <Text className="text-[24px] leading-[34px] font-pretendard-bold text-black">
                {challenge?.name}
              </Text>
            </View>
            {challenge && (
              <View className="flex-row items-center gap-[20px]">
                <View className="flex-row items-center gap-[4px]">
                  <IcCalendar width={20} height={20} />
                  <Text className="text-[15px] leading-[22px] tracking-[-0.3px] font-pretendard-regular text-gray-v2-60">
                    {ChallengeDateFormat.formatChallengeDetailPeriod(
                      challenge.startsAt,
                      challenge.endsAt,
                    )}
                  </Text>
                </View>
                <View className="flex-row items-center gap-[4px]">
                  <IcParticipants width={20} height={20} />
                  <Text className="text-[15px] leading-[22px] tracking-[-0.3px] font-pretendard-regular text-gray-v2-60">
                    {`${challenge.participationsCount}명`}
                  </Text>
                </View>
              </View>
            )}
          </View>
          {challenge && (
            <>
              <ChallengeDetailStatus challenge={challenge} />
              {challenge.description ? (
                <DescriptionRenderer
                  description={challenge.description}
                  isCollapsed={isDescriptionCollapsed}
                  onToggleCollapse={() =>
                    setIsDescriptionCollapsed(!isDescriptionCollapsed)
                  }
                />
              ) : (
                <Text className="px-[25px] mt-[25px] mb-[60px] text-[16px] leading-[26px] font-pretendard-regular text-black">
                  {`${challenge.name} 챌린지에서 ${
                    challenge.goal
                  }개 장소 정복에 도전해보세요!${
                    !isEmpty(challenge.milestones)
                      ? ` 중간목표 ${challenge.milestones[0]}개를 달성하면 콩알이 친구가 도전을 함께 하게 됩니다🤗`
                      : ''
                  }`}
                </Text>
              )}
              {challenge.hasConquerTargetPlaceList && hasJoined && (
                <View className="px-[25px] pb-[32px]">
                  <SccTouchableOpacity
                    elementName="challenge_detail_conquer_target_places"
                    activeOpacity={0.8}
                    className="border-[1.5px] border-brand-40 rounded-[8px] px-[28px] py-[12px] items-center justify-center"
                    onPress={() =>
                      navigation.navigate('ChallengeConquerTargetPlaces', {
                        challengeId,
                      })
                    }>
                    <Text className="text-[16px] leading-[24px] tracking-[-0.32px] font-pretendard-semibold text-brand-40">
                      남은 매장 보기
                    </Text>
                  </SccTouchableOpacity>
                </View>
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
        </ScrollView>
        {shouldShowStickyActionBar && (
          <ChallengeDetailStickyActionBar
            visible={visible}
            onGoConquer={() =>
              // Search는 Main tab 내부에 있어 nested navigate 필요.
              // initSortOption은 지정하지 않음 → 다른 검색 진입과 동일하게
              // filterAtom default(LOW_SCORE = 접근레벨낮은순) 적용.
              navigation.navigate('Main', {
                screen: 'Search',
                params: {
                  initKeyword: '',
                },
              } as never)
            }
          />
        )}
        {hasJoined === false && (
          <SafeAreaWrapper edges={['bottom']}>
            <View className="px-[20px] pt-[20px] pb-[12px] bg-white">
              <SccButton
                text={'챌린지 참여하기'}
                textColor="white"
                buttonColor="brandColor"
                fontFamily={font.pretendardBold}
                onPress={() => {
                  checkAuth(() => {
                    if (hasPasscode || isB2B) {
                      setShowPasscodeBottomSheet(true);
                    } else {
                      joinChallenge.mutate({challengeId});
                    }
                  });
                }}
                elementName="challenge_detail_join"
              />
            </View>
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
        <ChallengeWelcomeModal
          visible={shouldShowWelcomeModal}
          imageUrl={challenge?.welcomePopup?.imageUrl}
          description={challenge?.welcomePopup?.description}
        />
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

  // react-native-markdown-display 는 style prop 으로 style 객체만 받는 서드파티라
  // NativeWind className 대응이 안 된다 (기존 동작 그대로 유지).
  const markdownStyle = {
    body: {
      lineHeight: 26,
      fontSize: 16,
      letterSpacing: -0.08,
      color: color.gray85,
      fontFamily: font.pretendardRegular,
    },
    link: {
      color: color.brand60,
      fontSize: 16,
      lineHeight: 26,
      textDecorationLine: 'underline' as const,
      fontFamily: font.pretendardMedium,
    },
  };

  return (
    <View className="pt-[24px] pb-[12px]">
      <View className="mx-[20px] p-[16px] gap-[4px] bg-gray-v2-10 rounded-[12px]">
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
              className="items-end mt-[4px]">
              <Text
                className={cn(
                  'text-[14px] font-pretendard-regular text-gray-40',
                  isCollapsed && 'underline',
                )}>
                {isCollapsed ? '더보기' : '접기'}
              </Text>
            </SccTouchableOpacity>
          )}
        </View>
        {linkParagraph && (
          <Markdown style={markdownStyle}>{linkParagraph}</Markdown>
        )}
      </View>
    </View>
  );
};
