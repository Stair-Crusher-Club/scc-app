import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {useListInterestedRegions} from '@/hooks/useListInterestedRegions';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import BottomSheet from '@/modals/BottomSheet/BottomSheet';
import ToastUtils from '@/utils/ToastUtils';

interface RegionSelectBottomSheetProps {
  isVisible: boolean;
  /** 이미 선택되어 있는 그룹 id 목록. 시트 열릴 때 초기값으로 복원. */
  initialSelectedGroupIds: string[];
  onConfirm: (selectedGroupIds: string[]) => void;
  onClose: () => void;
}

/**
 * 관심 지역(시도/시군구 그룹) 선택 바텀시트.
 *
 * Figma 1629:29602 디자인 기준:
 * - 좌측: 시도 리스트 (서울, 경기, 인천, ...). 선택된 시도는 흰 배경, 비선택은 gray15.
 * - 우측: 선택된 시도의 시군구 그룹 (다중 선택). 항목을 탭하면 toggle.
 * - 우측 컬럼에는 그룹이 정의되지 않은 시도일 경우 "준비중" 안내를 노출.
 * - 하단 "확인" 버튼: 선택된 그룹이 1개 이상일 때만 파란색 활성.
 *
 * 시도/시군구 그룹 데이터는 `useListInterestedRegions` 훅을 통해 서버에서 동적으로 조회한다.
 */
export default function RegionSelectBottomSheet({
  isVisible,
  initialSelectedGroupIds,
  onConfirm,
  onClose,
}: RegionSelectBottomSheetProps) {
  const {data: sidos, isLoading, error} = useListInterestedRegions();
  const provinces = useMemo(() => sidos ?? [], [sidos]);

  const [activeProvinceId, setActiveProvinceId] = useState<string | null>(null);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    initialSelectedGroupIds,
  );

  // 시트가 열릴 때마다 초기값 동기화. 첫 시도 id로 activeProvince를 초기화.
  useEffect(() => {
    if (isVisible) {
      setSelectedGroupIds(initialSelectedGroupIds);
      setActiveProvinceId(provinces[0]?.id ?? null);
    }
  }, [isVisible, initialSelectedGroupIds, provinces]);

  // 서버 조회 실패 시 토스트 안내. (시트는 빈 상태로 노출되며 사용자는 닫고 다시 열 수 있음)
  useEffect(() => {
    if (isVisible && error) {
      ToastUtils.showOnApiError(error);
    }
  }, [isVisible, error]);

  const activeProvince = useMemo(
    () =>
      provinces.find(p => p.id === activeProvinceId) ?? provinces[0] ?? null,
    [provinces, activeProvinceId],
  );

  const toggleGroup = useCallback((groupId: string) => {
    setSelectedGroupIds(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId],
    );
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(selectedGroupIds);
  }, [selectedGroupIds, onConfirm]);

  const isConfirmEnabled = selectedGroupIds.length > 0;

  return (
    <BottomSheet isVisible={isVisible} onPressBackground={onClose}>
      <LogParamsProvider
        params={{displaySectionName: 'interested_region_bottom_sheet'}}>
        <SheetHeader>
          <SheetHandle />
        </SheetHeader>
        <ContentsContainer>
          <TitleArea>
            <Title>관심 지역을 설정해주세요</Title>
            <Description>설정한 지역에 맞는 정보를 추천해드려요!</Description>
          </TitleArea>
          <TwoColumnContainer>
            {isLoading && provinces.length === 0 ? (
              <LoadingContainer>
                <ActivityIndicator size="large" color={color.brand40} />
              </LoadingContainer>
            ) : (
              <>
                <ProvinceColumn
                  showsVerticalScrollIndicator={false}
                  persistentScrollbar={false}>
                  {provinces.map(province => {
                    const isActive = province.id === activeProvinceId;
                    return (
                      <ProvinceItem
                        key={province.id}
                        elementName="interested_region_province_item"
                        logParams={{province_id: province.id}}
                        onPress={() => setActiveProvinceId(province.id)}
                        active={isActive}>
                        <ProvinceLabel active={isActive}>
                          {province.label}
                        </ProvinceLabel>
                      </ProvinceItem>
                    );
                  })}
                </ProvinceColumn>
                <GroupColumn
                  showsVerticalScrollIndicator={false}
                  persistentScrollbar={false}>
                  {!activeProvince || activeProvince.groups.length === 0 ? (
                    <EmptyGroupNotice>준비 중입니다.</EmptyGroupNotice>
                  ) : (
                    activeProvince.groups.map(group => {
                      const isSelected = selectedGroupIds.includes(group.id);
                      return (
                        <GroupItem
                          key={group.id}
                          elementName="interested_region_group_item"
                          logParams={{group_id: group.id}}
                          onPress={() => toggleGroup(group.id)}>
                          <GroupLabel selected={isSelected}>
                            {group.label}
                          </GroupLabel>
                        </GroupItem>
                      );
                    })
                  )}
                </GroupColumn>
              </>
            )}
          </TwoColumnContainer>
        </ContentsContainer>
        <BottomBar>
          <SccButton
            text="확인"
            elementName="interested_region_confirm_button"
            onPress={handleConfirm}
            buttonColor="brand40"
            textColor="white"
            fontFamily={font.pretendardSemibold}
            fontSize={18}
            height={56}
            isDisabled={!isConfirmEnabled}
            style={{borderRadius: 8}}
          />
        </BottomBar>
      </LogParamsProvider>
    </BottomSheet>
  );
}

const SheetHeader = styled.View`
  width: 100%;
  height: 36px;
  align-items: center;
  justify-content: center;
  padding-bottom: 4px;
`;

const SheetHandle = styled.View`
  width: 48px;
  height: 4px;
  border-radius: 2px;
  background-color: ${color.gray20v2};
`;

const ContentsContainer = styled.View`
  background-color: ${color.white};
`;

const TitleArea = styled.View`
  padding: 0 20px;
  gap: 4px;
`;

const Title = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 22px;
  line-height: 30px;
  letter-spacing: -0.44px;
  color: ${color.black};
`;

const Description = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.gray70v2};
`;

const TwoColumnContainer = styled.View`
  margin-top: 20px;
  height: 522px;
  flex-direction: row;
  border-top-width: 1px;
  border-top-color: ${color.gray15v2};
`;

const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const ProvinceColumn = styled.ScrollView`
  width: 110px;
  background-color: ${color.gray15v2};
`;

const ProvinceItem = styled(SccPressable)<{active: boolean}>`
  padding: 16px 20px;
  background-color: ${({active}) => (active ? color.white : color.gray15v2)};
`;

const ProvinceLabel = styled.Text<{active: boolean}>`
  font-family: ${({active}) =>
    active ? font.pretendardSemibold : font.pretendardRegular};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.gray90v2};
`;

const GroupColumn = styled.ScrollView`
  flex: 1;
  background-color: ${color.white};
`;

const GroupItem = styled(SccPressable)`
  padding: 16px;
`;

const GroupLabel = styled.Text<{selected: boolean}>`
  font-family: ${({selected}) =>
    selected ? font.pretendardSemibold : font.pretendardRegular};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${({selected}) => (selected ? color.brand40 : color.gray90v2)};
`;

const EmptyGroupNotice = styled.Text`
  padding: 16px;
  font-family: ${font.pretendardRegular};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.gray50v2};
`;

const BottomBar = styled.View`
  padding: 16px 20px 24px;
  background-color: ${color.white};
`;
