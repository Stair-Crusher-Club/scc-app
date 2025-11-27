import React, {useCallback} from 'react';
import {Linking, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import styled from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {UpvoteTargetTypeDto} from '@/generated-sources/openapi';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {SccButton} from '@/components/atoms/SccButton';
import {SccPressable} from '@/components/SccPressable';
import {useUpvoteToggle} from '@/hooks/useUpvoteToggle';
import ShareUtils from '@/utils/ShareUtils';
import ToastUtils from '@/utils/ToastUtils';
import useAppComponents from '@/hooks/useAppComponents';
import {useMe} from '@/atoms/Auth';

import ThumbsUpIcon from '@/assets/icon/ic_thumbs_up.svg';
import ThumbsUpFillIcon from '@/assets/icon/ic_thumbs_up_fill.svg';
import ShareIcon from '@/assets/icon/ic_share.svg';
import {useCheckAuth} from '@/utils/checkAuth';

interface BbucleRoadFloatingBarProps {
  bbucleRoadId: string;
  title?: string;
}

export default function BbucleRoadFloatingBar({
  bbucleRoadId,
  title,
}: BbucleRoadFloatingBarProps) {
  const {api} = useAppComponents();
  const insets = useSafeAreaInsets();
  const {userInfo} = useMe();

  // Upvote 상태 조회
  const {data: upvoteDetails} = useQuery({
    queryKey: ['BbucleRoadUpvoteDetails', bbucleRoadId],
    queryFn: async () => {
      return await api.getUpvoteDetailsPost({
        targetType: UpvoteTargetTypeDto.BbucleRoad,
        id: bbucleRoadId,
      });
    },
    enabled: !!bbucleRoadId,
  });

  const upvotedUsers = upvoteDetails?.data?.upvotedUsers ?? [];
  const totalCount = upvotedUsers.length;
  const hasUpvoted =
    upvotedUsers.some(user => user.nickname === userInfo?.nickname) ?? false;

  // Upvote 토글 hook
  const {isUpvoted, totalUpvoteCount, toggleUpvote} = useUpvoteToggle({
    initialIsUpvoted: hasUpvoted,
    initialTotalCount: totalCount,
    targetId: bbucleRoadId,
    targetType: UpvoteTargetTypeDto.BbucleRoad,
    placeId: '', // 뿌클로드는 장소 ID가 없음
  });
  const checkAuth = useCheckAuth();

  // 공유하기
  const handleShare = useCallback(async () => {
    try {
      await ShareUtils.shareBbucleRoad(bbucleRoadId, title);
    } catch (_error) {
      // Share 취소는 에러로 처리하지 않음
    }
  }, [bbucleRoadId, title]);

  // 정보 더 받아보기 (Tally 링크)
  const handleMoreInfo = useCallback(async () => {
    try {
      const tallyUrl = 'https://forms.staircrusher.club/contents-alarm';
      await Linking.openURL(tallyUrl);
    } catch (_error) {
      ToastUtils.show('링크를 열 수 없습니다');
    }
  }, []);

  return (
    <Container style={{paddingBottom: insets.bottom}}>
      <ContentRow>
        {/* 도움이 돼요 버튼 */}
        <UpvoteButton
          onPress={() => {
            checkAuth(toggleUpvote, () =>
              ToastUtils.show('로그인이 필요합니다'),
            );
          }}
          elementName="bbucleroad-upvote"
          logParams={{bbucleRoadId}}>
          {isUpvoted ? (
            <ThumbsUpFillIcon width={20} height={20} />
          ) : (
            <ThumbsUpIcon width={20} height={20} />
          )}
          {totalUpvoteCount !== undefined && totalUpvoteCount > 0 ? (
            <UpvoteCount isActive={isUpvoted}>{totalUpvoteCount}</UpvoteCount>
          ) : null}
        </UpvoteButton>

        <Spacer />

        {/* 공유하기 버튼 */}
        <SccButton
          text="공유하기"
          leftIcon={ShareIcon}
          iconSize={16}
          iconColor="gray50"
          buttonColor="white"
          textColor="gray90"
          borderColor="gray25"
          style={{paddingHorizontal: 20, borderRadius: 8}}
          fontSize={14}
          fontWeight={'500'}
          height={40}
          onPress={handleShare}
          elementName="bbucleroad-share"
          logParams={{bbucleRoadId}}
        />

        {/* 정보 더 받아보기 버튼 */}
        <SccButton
          text="정보 더 받아보기"
          buttonColor="brand40"
          textColor="white"
          style={{paddingHorizontal: 20, borderRadius: 8}}
          fontSize={14}
          fontWeight={'500'}
          height={40}
          onPress={handleMoreInfo}
          elementName="bbucleroad-more-info"
          logParams={{bbucleRoadId}}
        />
      </ContentRow>
    </Container>
  );
}

const Container = styled(View)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${color.white};
  border-top-width: 1px;
  border-top-color: ${color.gray20};
  shadow-color: #000;
  shadow-offset: 0px -2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 5;
`;

const ContentRow = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
`;

const UpvoteButton = styled(SccPressable)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 10px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${color.gray25};
  background-color: ${color.white};
`;

const UpvoteCount = styled.Text<{isActive: boolean}>`
  font-size: 14px;
  font-family: ${font.pretendardSemibold};
  color: ${color.gray80};
`;

const Spacer = styled(View)`
  flex: 1;
`;
