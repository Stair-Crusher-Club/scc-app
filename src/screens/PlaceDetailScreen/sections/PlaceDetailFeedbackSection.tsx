import {useAtom} from 'jotai';
import React, {useEffect, useState} from 'react';

import {loadingState} from '@/components/LoadingView';
import {color} from '@/constant/color';
import {AccessibilityInfoDto, DefaultApi} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import ToastUtils from '@/utils/ToastUtils';
import {useCheckAuth} from '@/utils/checkAuth';

import {useDeleteAccessibility} from '../hooks/useDeleteAccessibility';
import PlaceDetailDeleteBottomSheet from '../modals/PlaceDetailDeleteBottomSheet';
import PlaceDetailNegativeFeedbackBottomSheet from '../modals/PlaceDetailNegativeFeedbackBottomSheet';
import * as S from './PlaceDetailFeedbackSection.style';

interface PlaceDetailFeedbackSectionProps {
  accessibility: AccessibilityInfoDto;
}

export const PlaceDetailFeedbackSection = ({
  accessibility,
}: PlaceDetailFeedbackSectionProps) => {
  const [loading, setLoading] = useAtom(loadingState);
  const {api} = useAppComponents();
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [
    isNegativeFeedbackOptionModalVisible,
    setIsNegativeFeedbackOptionModalVisible,
  ] = useState(false);
  const [isPlaceDeleteModalVisible, setIsPlaceDeleteModalVisible] =
    useState(false);
  const [isBuildingDeleteModalVisible, setIsBuildingDeleteModalVisible] =
    useState(false);
  const checkAuth = useCheckAuth();

  useEffect(() => {
    setIsUpvoted(accessibility.placeAccessibility?.isUpvoted ?? false);
  }, [accessibility]);

  const toggleUpvote = async () => {
    checkAuth(async () => {
      const placeAccessibilityId = accessibility?.placeAccessibility?.id;
      if (placeAccessibilityId) {
        setIsUpvoted(!isUpvoted);
        const success = await updateUpvoteStatus(
          api,
          placeAccessibilityId,
          !isUpvoted,
        );
        if (!success) {
          setIsUpvoted(isUpvoted);
        }
      }
    });
  };

  const deletePlaceAccessibility = useDeleteAccessibility(
    'place',
    accessibility,
  );
  const deleteBuildingAccessibility = useDeleteAccessibility(
    'building',
    accessibility,
  );

  const showNegativeFeedbackBottomSheet = () => {
    checkAuth(() => {
      setIsNegativeFeedbackOptionModalVisible(true);
    });
  };

  const showPlaceDeleteConfirmBottomSheet = () => {
    checkAuth(() => {
      setIsPlaceDeleteModalVisible(true);
    });
  };

  const showBuildingDeleteConfirmBottomSheet = () => {
    checkAuth(() => {
      setIsBuildingDeleteModalVisible(true);
    });
  };

  const isPlaceDeletable = !!accessibility.placeAccessibility?.isDeletable; // FIXME: login check
  const isBuildingDeletable =
    !!accessibility.buildingAccessibility?.isDeletable;

  return (
    <S.PlaceDetailFeedbackSection>
      <S.SectionTitle>이 정보가 도움이 되었나요?</S.SectionTitle>
      <S.Buttons>
        <S.UpvoteButton onPress={toggleUpvote} upvoted={isUpvoted}>
          <S.ButtonText color={isUpvoted ? color.brandColor : color.gray70}>
            정확해요 👍
          </S.ButtonText>
        </S.UpvoteButton>
        <S.DefaultButton onPress={showNegativeFeedbackBottomSheet}>
          <S.ButtonText color={color.gray70}>신고할래요 👎</S.ButtonText>
        </S.DefaultButton>
      </S.Buttons>
      {isPlaceDeletable && (
        <S.Buttons>
          <S.DeleteButton onPress={showPlaceDeleteConfirmBottomSheet}>
            <S.DeleteButtonText>장소 정보 삭제하기</S.DeleteButtonText>
          </S.DeleteButton>
        </S.Buttons>
      )}
      {isBuildingDeletable && (
        <S.Buttons>
          <S.DeleteButton onPress={showBuildingDeleteConfirmBottomSheet}>
            <S.DeleteButtonText>건물 정보 삭제하기</S.DeleteButtonText>
          </S.DeleteButton>
        </S.Buttons>
      )}
      {accessibility.placeAccessibility?.placeId && (
        <PlaceDetailNegativeFeedbackBottomSheet
          isVisible={isNegativeFeedbackOptionModalVisible}
          placeId={accessibility.placeAccessibility.placeId}
          onPressCloseButton={() => {
            setIsNegativeFeedbackOptionModalVisible(false);
          }}
          onPressSubmitButton={async (placeId, reason, text) => {
            setIsNegativeFeedbackOptionModalVisible(false);
            setLoading(new Map(loading).set('PlaceDetail', true));
            await api.reportAccessibilityPost({
              placeId,
              reason,
              detail: text,
            });
            setLoading(new Map(loading).set('PlaceDetail', false));
            ToastUtils.show('신고가 접수되었습니다.');
          }}
        />
      )}
      <PlaceDetailDeleteBottomSheet
        isVisible={isPlaceDeleteModalVisible}
        onPressCancelButton={() => setIsPlaceDeleteModalVisible(false)}
        onPressConfirmButton={() => {
          deletePlaceAccessibility.mutate();
          setIsPlaceDeleteModalVisible(false);
        }}
      />
      <PlaceDetailDeleteBottomSheet
        isVisible={isBuildingDeleteModalVisible}
        onPressCancelButton={() => setIsBuildingDeleteModalVisible(false)}
        onPressConfirmButton={() => {
          deleteBuildingAccessibility.mutate();
          setIsBuildingDeleteModalVisible(false);
        }}
      />
    </S.PlaceDetailFeedbackSection>
  );
};

async function updateUpvoteStatus(
  api: DefaultApi,
  placeAccessibilityId: string,
  newUpvotedStatus: boolean,
) {
  try {
    if (newUpvotedStatus === false) {
      await api.cancelPlaceAccessibilityUpvotePost({
        placeAccessibilityId,
      });
    } else {
      await api.givePlaceAccessibilityUpvotePost({
        placeAccessibilityId,
      });
    }
    ToastUtils.show('좋은 의견 감사합니다!');
    return true;
  } catch (error: any) {
    ToastUtils.showOnApiError(error);
    return false;
  }
}
