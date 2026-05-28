import React, {useCallback} from 'react';
import {Linking, Share, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import styled from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  SccContentTypeDto,
  UpvoteTargetTypeDto,
} from '@/generated-sources/openapi';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {SccButton} from '@/components/atoms/SccButton';
import {SccPressable} from '@/components/SccPressable';
import {useUpvoteToggle} from '@/hooks/useUpvoteToggle';
import {useSaveContent} from '@/hooks/useSaveContent';
import ShareUtils from '@/utils/ShareUtils';
import ToastUtils from '@/utils/ToastUtils';
import useAppComponents from '@/hooks/useAppComponents';

import ThumbsUpIcon from '@/assets/icon/ic_thumbs_up.svg';
import ThumbsUpFillIcon from '@/assets/icon/ic_thumbs_up_fill.svg';
import BookmarkIcon from '@/assets/icon/ic_bookmark.svg';
import BookmarkFilledIcon from '@/assets/icon/ic_bookmark_filled.svg';
import ShareIcon from '@/assets/icon/ic_share.svg';
import {useCheckAuth} from '@/utils/checkAuth';

interface SccContentFloatingBarProps {
  url: string;
  title?: string;
  ogTitle?: string | null;
  ogThumbnailUrl?: string | null;
  ogDescription?: string | null;
}

export default function SccContentFloatingBar({
  url,
  title,
  ogTitle,
  ogThumbnailUrl,
  ogDescription,
}: SccContentFloatingBarProps) {
  const {api} = useAppComponents();
  const insets = useSafeAreaInsets();

  // SccContent 통합 상태 조회 (isSaved + isUpvoted + totalUpvoteCount + sccContentId)
  const {data: sccContentDetails, isLoading: isDetailsLoading} = useQuery({
    queryKey: ['SccContentDetails', url],
    queryFn: async () => {
      return (await api.getSccContentDetails({url})).data;
    },
  });

  const sccContentId = sccContentDetails?.sccContentId ?? null;
  const isSaved = sccContentDetails?.isSaved ?? false;
  const initialIsUpvoted = sccContentDetails?.isUpvoted ?? false;
  const initialTotalUpvoteCount =
    sccContentDetails?.totalUpvoteCount ?? undefined;

  // Upvote 토글 hook (SccContent 좋아요는 장소 무관 → placeId undefined)
  const {isUpvoted, totalUpvoteCount, toggleUpvote} = useUpvoteToggle({
    initialIsUpvoted,
    initialTotalCount: initialTotalUpvoteCount,
    targetId: sccContentId ?? undefined,
    targetType: UpvoteTargetTypeDto.BbucleRoad,
    placeId: undefined,
  });
  const checkAuth = useCheckAuth();
  const saveContent = useSaveContent();

  const handleToggleSave = useCallback(() => {
    saveContent({
      url,
      contentType: SccContentTypeDto.WebPage,
      title: ogTitle ?? title ?? null,
      thumbnailUrl: ogThumbnailUrl ?? null,
      description: ogDescription ?? null,
      currentIsSaved: isSaved,
      currentSccContentId: sccContentId,
    });
  }, [
    saveContent,
    url,
    ogTitle,
    title,
    ogThumbnailUrl,
    ogDescription,
    isSaved,
    sccContentId,
  ]);

  // 공유하기
  const handleShare = useCallback(async () => {
    try {
      if (sccContentId) {
        await ShareUtils.shareBbucleRoad(sccContentId, title);
      } else {
        await Share.share({
          message: title
            ? `[${title}]를 계단뿌셔클럽에서 확인해보세요!\n${url}`
            : url,
        });
      }
    } catch (_error) {
      // Share 취소는 에러로 처리하지 않음
    }
  }, [sccContentId, url, title]);

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
        {/* 도움이 돼요 버튼 (sccContentId 있을 때만) */}
        {sccContentId !== null && (
          <UpvoteButton
            onPress={() => {
              checkAuth(toggleUpvote, () =>
                ToastUtils.show('로그인이 필요합니다'),
              );
            }}
            elementName="scc-content-upvote"
            logParams={{sccContentId}}>
            {isUpvoted ? (
              <ThumbsUpFillIcon width={20} height={20} />
            ) : (
              <ThumbsUpIcon width={20} height={20} />
            )}
            {totalUpvoteCount !== undefined && totalUpvoteCount > 0 ? (
              <UpvoteCount isActive={isUpvoted}>{totalUpvoteCount}</UpvoteCount>
            ) : null}
          </UpvoteButton>
        )}

        {/* 저장 버튼 — 상세 조회 로딩 중에는 잘못된 isSaved=false 가 잠깐 보이는 플리커를 막기 위해 disable */}
        <SaveButton
          disabled={isDetailsLoading}
          onPress={() => {
            if (isDetailsLoading) return;
            checkAuth(handleToggleSave, () =>
              ToastUtils.show('로그인이 필요합니다'),
            );
          }}
          elementName="scc-content-save"
          logParams={{url, isSaved}}>
          {isSaved ? (
            <BookmarkFilledIcon width={20} height={20} color={color.gray80} />
          ) : (
            <BookmarkIcon width={16} height={20} color={color.gray80} />
          )}
          <SaveLabel isActive={isSaved}>
            {isSaved ? '저장됨' : '저장'}
          </SaveLabel>
        </SaveButton>

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
          elementName="scc-content-share"
          logParams={{sccContentId, url}}
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
          elementName="scc-content-more-info"
          logParams={{sccContentId, url}}
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

const SaveButton = styled(SccPressable)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 10px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${color.gray25};
  background-color: ${color.white};
`;

const SaveLabel = styled.Text<{isActive: boolean}>`
  font-size: 14px;
  font-family: ${font.pretendardSemibold};
  color: ${color.gray80};
`;

const UpvoteCount = styled.Text<{isActive: boolean}>`
  font-size: 14px;
  font-family: ${font.pretendardSemibold};
  color: ${color.gray80};
`;

const Spacer = styled(View)`
  flex: 1;
`;
