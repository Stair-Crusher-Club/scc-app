import React, {useCallback} from 'react';
import {Share, View} from 'react-native';
import {keepPreviousData, useQuery} from '@tanstack/react-query';
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
import ShareIcon from '@/assets/icon/ic_share.svg';
import BookmarkIcon from '@/assets/icon/ic_v2_bookmark.svg';
import BookmarkFilledIcon from '@/assets/icon/ic_v2_bookmark_on.svg';
import {useCheckAuth} from '@/utils/checkAuth';

/**
 * 웹페이지에서 추출한 OG 메타 + 본문 이미지 묶음.
 * SccContent 저장 시 서버로 전달되는 metadata.
 */
export interface OgDetail {
  title?: string | null;
  /** og:image + 본문 <img> 합쳐서 중복 제거 + 등장 순서로 정렬된 절대 URL 목록. */
  imageUrls?: string[];
  description?: string | null;
}

interface SccContentFloatingBarProps {
  url: string;
  /** BBUCLE_ROAD 좋아요용 path id. URL path에서 추출한 식별자. */
  bbucleRoadId: string | null;
  /** 화면 상단 (header) 에 노출되는 title. fixedTitle / OG title / document.title 중 하나. */
  title?: string;
  /** 웹페이지 OG 메타 + 본문 이미지. 저장 호출 시 그대로 서버로 전달. */
  ogDetail?: OgDetail;
}

export default function SccContentFloatingBar({
  url,
  bbucleRoadId,
  title,
  ogDetail,
}: SccContentFloatingBarProps) {
  const {api} = useAppComponents();
  const insets = useSafeAreaInsets();

  // 저장(SccContent) 상태 + 좋아요 요약 통합 조회.
  // 웹뷰 진입 시 라운드트립 1회로 isSaved + sccContentId + upvoteSummary 를 모두 받는다.
  // URL 만 보내면 서버가 URL pattern 으로 좋아요 target (e.g. BBUCLE_ROAD path id) 을 추론하여
  // upvoteSummary (totalCount, isUpvoted) 를 채워준다. 좋아요 대상이 아닌 URL 이면 null.
  // query key 는 useSaveContent 의 cache key 와 정확히 일치시켜야 한다
  // (낙관적 setQueryData 가 exact match 로 동작하므로).
  //
  // 웹뷰 내 페이지 이동(con.staircrusher.club 안에서 다른 컨텐츠로 navigate) 시
  // url 이 바뀌면서 queryKey 가 새것이 되어 isLoading=true 가 잠시 뜨면 저장 버튼이 깜빡인다.
  // placeholderData: keepPreviousData 로 이전 url 의 응답을 background fetch 동안 그대로 보여줘
  // 깜빡임을 막는다. 새 데이터 도착 시 자연스럽게 교체된다.
  const {data: sccContentDetails} = useQuery({
    queryKey: ['SccContentDetails', url],
    queryFn: async () => {
      return (await api.getSccContentDetails({url})).data;
    },
    placeholderData: keepPreviousData,
  });
  // 진짜 데이터가 한 번도 없는 첫 로드일 때만 disable. URL 이 바뀐 중간 fetch 동안은
  // 이전 응답 (placeholder) 이 깔리므로 sccContentDetails 가 정의되어 있어 disable 되지 않는다.
  const isDetailsLoading = sccContentDetails === undefined;
  const sccContentId = sccContentDetails?.sccContentId ?? null;
  const isSaved = sccContentDetails?.isSaved ?? false;

  const upvoteSummary = sccContentDetails?.upvoteSummary;
  const initialIsUpvoted = upvoteSummary?.isUpvoted ?? false;
  const initialTotalUpvoteCount = upvoteSummary?.totalCount;

  // Upvote 토글 hook — BBUCLE_ROAD 좋아요는 장소와 무관하므로 placeId undefined
  const {isUpvoted, totalUpvoteCount, toggleUpvote} = useUpvoteToggle({
    initialIsUpvoted,
    initialTotalCount: initialTotalUpvoteCount,
    targetId: bbucleRoadId ?? undefined,
    targetType: UpvoteTargetTypeDto.BbucleRoad,
    placeId: undefined,
  });
  const checkAuth = useCheckAuth();
  const saveContent = useSaveContent();

  const handleToggleSave = useCallback(() => {
    saveContent({
      url,
      contentType: SccContentTypeDto.WebPage,
      title: ogDetail?.title ?? title ?? null,
      imageUrls: ogDetail?.imageUrls ?? [],
      description: ogDetail?.description ?? null,
      currentIsSaved: isSaved,
      currentSccContentId: sccContentId,
    });
  }, [saveContent, url, ogDetail, title, isSaved, sccContentId]);

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

  return (
    <Container style={{paddingBottom: insets.bottom}}>
      <ContentRow>
        {/* 도움이 돼요는 BBUCLE_ROAD path id가 추출되는 컨텐츠에서만 노출 */}
        {bbucleRoadId !== null && (
          <UpvoteButton
            onPress={() => {
              checkAuth(toggleUpvote, () =>
                ToastUtils.show('로그인이 필요합니다'),
              );
            }}
            elementName="scc-content-upvote"
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
        )}

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

        {/* 저장하기 / 저장됨 토글 — 디자이너 피드백으로 기존 '정보 더 받아보기' 자리를 대체 */}
        <SccButton
          text={isSaved ? '저장완료' : '저장하기'}
          leftIcon={isSaved ? BookmarkFilledIcon : BookmarkIcon}
          iconSize={16}
          buttonColor="brand40"
          textColor="white"
          style={{paddingHorizontal: 20, borderRadius: 8}}
          fontSize={14}
          fontWeight={'500'}
          height={40}
          isDisabled={isDetailsLoading}
          onPress={() => {
            if (isDetailsLoading) return;
            checkAuth(handleToggleSave, () =>
              ToastUtils.show('로그인이 필요합니다'),
            );
          }}
          elementName="scc-content-save"
          logParams={{sccContentId, url, isSaved}}
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
  color: ${({isActive}) => (isActive ? color.brand40 : color.gray80)};
`;

const Spacer = styled(View)`
  flex: 1;
`;
