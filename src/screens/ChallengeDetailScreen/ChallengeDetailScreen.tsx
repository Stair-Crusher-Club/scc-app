import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import {isEmpty} from 'lodash';
import React, {useState} from 'react';
import {useRecoilState} from 'recoil';
import styled from 'styled-components/native';

import ChallengeStatusBadges from '@/components/ChallengeStatusBadges';
import {loadingState} from '@/components/LoadingView';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccButton} from '@/components/atoms';
import {font} from '@/constant/font';
import {
  ApiErrorResponse,
  JoinChallengeRequestDto,
  JoinChallengeResponseDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ToastUtils from '@/utils/ToastUtils';

import * as S from './ChallengeDetailScreen.style';
import ChallengeDetailMetrics from './components/ChallengeDetailMetrics';
import ChallengeDetailPasscodeBottomSheet from './components/ChallengeDetailPasscodeBottomSheet';
import ChallengeDetailRankSection from './components/ChallengeDetailRankSection/ChallengeDetailRankSection';
import ChallengeDetailStatus from './components/ChallengeDetailStatus';

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
  const [loading, setLoading] = useRecoilState(loadingState);

  const queryClient = useQueryClient();
  const {data} = useQuery({
    queryKey: ['ChallengeDetail', challengeId],
    queryFn: async ({queryKey}) =>
      (await api.getChallengePost({challengeId: queryKey[1]})).data,
  });
  const challenge = data?.challenge;
  const ranks = data?.ranks ?? [];
  const myRank = data?.myRank;
  const hasJoined = data?.hasJoined ?? false;
  const hasPasscode = data?.hasPasscode ?? false;

  const joinChallenge = useMutation<
    JoinChallengeResponseDto,
    AxiosError<ApiErrorResponse>,
    JoinChallengeRequestDto,
    unknown
  >({
    mutationKey: ['ChallengeDetail', challengeId],
    mutationFn: async ({passcode}) =>
      (await api.joinChallengePost({challengeId, passcode})).data,
    onSettled: () => setLoading(new Map(loading).set('ChallengeDetail', false)),
    onMutate: () => setLoading(new Map(loading).set('ChallengeDetail', true)),
    onError: error => ToastUtils.showOnApiError(error),
    onSuccess: _ =>
      queryClient.invalidateQueries({
        queryKey: ['ChallengeDetail', challengeId],
      }),
  });

  return (
    <LogParamsProvider params={{challenge_id: challengeId}}>
      <ScreenLayout isHeaderVisible={false} safeAreaEdges={['bottom']}>
        <S.Container>
          <S.Contents>
            <ChallengeStatusBadgesWrapper
              status={[challenge?.status ?? 'Closed']}
              isMyChallenge={hasJoined}
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
                <S.GuideText>{`${challenge.name} 챌린지에서 ${
                  challenge.goal
                }개 장소 정복에 도전해보세요!${
                  !isEmpty(challenge.milestones)
                    ? ` 중간목표 ${challenge.milestones[0]}개를 달성하면 콩알이 친구가 도전을 함께 하게 됩니다🤗`
                    : ''
                }`}</S.GuideText>
              </>
            )}
            {!isEmpty(ranks) && (
              <ChallengeDetailRankSection ranks={ranks} myRank={myRank} />
            )}
          </S.Contents>
        </S.Container>
        <S.ButtonContainer>
          {hasJoined && (
            <SccButton
              text={'장소 정복하러 가기'}
              textColor="white"
              buttonColor="brandColor"
              fontFamily={font.pretendardBold}
              onPress={() => {
                navigation.navigate('Search', {initKeyword: ''});
              }}
            />
          )}
          {!hasJoined && (
            <SccButton
              text={'챌린지 참여하기'}
              textColor="white"
              buttonColor="brandColor"
              fontFamily={font.pretendardBold}
              onPress={() => {
                if (hasPasscode) {
                  setShowPasscodeBottomSheet(true);
                } else {
                  joinChallenge.mutate({challengeId});
                }
              }}
            />
          )}
        </S.ButtonContainer>
        <ChallengeDetailPasscodeBottomSheet
          isVisible={showPasscodeBottomSheet}
          onPressCloseButton={() => {
            setShowPasscodeBottomSheet(false);
          }}
          onPressConfirmButton={passcode => {
            setShowPasscodeBottomSheet(false);
            joinChallenge.mutate({challengeId, passcode});
          }}
        />
      </ScreenLayout>
    </LogParamsProvider>
  );
};

export default ChallengeDetailScreen;

const ChallengeStatusBadgesWrapper = styled(ChallengeStatusBadges)`
  margin: 0 25px 14px 25px;
`;
