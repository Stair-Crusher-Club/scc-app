import React, {useState, useCallback} from 'react';
import {Platform} from 'react-native';

import {Location} from '@/generated-sources/openapi';
import LocationConfirmBottomSheet from '@/modals/LocationConfirmBottomSheet';
import {showAppInstallPrompt} from '@/utils/appInstallPrompt';
import {getDistanceFromCurrentLocation as getDistanceMetersFromCurrentLocation} from '@/utils/LocationCheckUtils';

interface NavigateWithLocationCheckParams {
  targetLocation: Location | undefined;
  placeName?: string;
  address: string;
  type: 'place' | 'building';
  onNavigate: () => void;
}

export default function useNavigateWithLocationCheck() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    placeName?: string;
    address: string;
    type: 'place' | 'building';
    onNavigate: () => void;
  } | null>(null);

  const navigateWithLocationCheck = useCallback(
    async ({
      targetLocation,
      placeName,
      address,
      type,
      onNavigate,
    }: NavigateWithLocationCheckParams) => {
      // 웹: 대상(정보등록/리뷰 폼)은 모두 앱 전용이다. 이동하지 않고 여기서 막는다 —
      // 이동 후 라우트 게이트가 goBack 하는 방식은 폼의 나가기 확인 시트에 막혀
      // 계속 작성할 수 있었다(PlaceFormV2·BuildingFormV2).
      if (Platform.OS === 'web') {
        showAppInstallPrompt('이 기능은 앱에서만 이용할 수 있어요');
        return;
      }
      // 거리 체크
      const distance =
        await getDistanceMetersFromCurrentLocation(targetLocation);

      if (distance !== undefined && distance <= 200) {
        // 200m 이내면 바로 navigate
        onNavigate();
      } else {
        // 200m 초과면 모달 표시
        setModalData({placeName, address, type, onNavigate});
        setIsModalVisible(true);
      }
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    setIsModalVisible(false);
    if (modalData) {
      modalData.onNavigate();
    }
    setModalData(null);
  }, [modalData]);

  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
    setModalData(null);
  }, []);

  const LocationConfirmModal = (
    <LocationConfirmBottomSheet
      isVisible={isModalVisible}
      placeName={modalData?.placeName}
      address={modalData?.address ?? ''}
      type={modalData?.type ?? 'place'}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return {
    navigateWithLocationCheck,
    LocationConfirmModal,
  };
}
