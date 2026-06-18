import React, {useState, useCallback} from 'react';
import {Platform} from 'react-native';

import {Location} from '@/generated-sources/openapi';
import LocationConfirmBottomSheet from '@/modals/LocationConfirmBottomSheet';
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
      // 웹: 위치 확인 모달은 "현장 방문" 전제라 의미가 없고, 대상(정보등록/리뷰)은
      // 모두 앱 전용이라 어차피 라우트 게이트가 앱 설치를 유도한다. 모달 없이 바로
      // 진행해 앱 설치 팝업이 위치 모달에 가려지지 않고 즉시 뜨게 한다.
      if (Platform.OS === 'web') {
        onNavigate();
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
