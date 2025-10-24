import React, {useState, useCallback} from 'react';

import {Location} from '@/generated-sources/openapi';
import LocationConfirmBottomSheet from '@/modals/LocationConfirmBottomSheet';
import {getDistanceFromCurrentLocation as getDistanceMetersFromCurrentLocation} from '@/utils/LocationCheckUtils';

interface NavigateWithLocationCheckParams {
  targetLocation: Location | undefined;
  address: string;
  type: 'place' | 'building';
  onNavigate: () => void;
}

export default function useNavigateWithLocationCheck() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    address: string;
    type: 'place' | 'building';
    onNavigate: () => void;
  } | null>(null);

  const navigateWithLocationCheck = useCallback(
    async ({
      targetLocation,
      address,
      type,
      onNavigate,
    }: NavigateWithLocationCheckParams) => {
      // 거리 체크
      const distance = await getDistanceMetersFromCurrentLocation(targetLocation);

      if (distance !== undefined && distance <= 200) {
        // 200m 이내면 바로 navigate
        onNavigate();
      } else {
        // 200m 초과면 모달 표시
        setModalData({address, type, onNavigate});
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
