import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import styled from 'styled-components/native';

import CheckColoredIcon from '@/assets/icon/ic_check_colored.svg';
import CloseChipIcon from '@/assets/icon/ic_x_black.svg';
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
 * Figma 1648:38919 디자인 기준:
 * - 상단: 선택된 그룹 chip row (X 클릭으로 제거).
 * - 좌측 110px: 시도 리스트. active는 white bg, inactive는 gray15 bg.
 * - 우측: 시도의 시군구 그룹. 선택된 항목은 우측에 check 아이콘 표시.
 * - 하단 "확인" 버튼: 선택된 그룹이 1개 이상일 때만 파란색 활성.
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

  // 모든 그룹의 id → label 조회용 lookup (선택된 chip 라벨 표시에 사용).
  const groupLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const province of provinces) {
      for (const group of province.groups) {
        map.set(group.id, group.label);
      }
    }
    return map;
  }, [provinces]);

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
          {selectedGroupIds.length > 0 && (
            <SelectedChipRow
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 8,
                paddingHorizontal: 20,
              }}>
              {selectedGroupIds.map(id => {
                const label = groupLabelById.get(id) ?? id;
                return (
                  <SelectedChip key={id}>
                    <SelectedChipLabel>{label}</SelectedChipLabel>
                    <ChipCloseButton
                      elementName="interested_region_selected_chip_remove"
                      logParams={{group_id: id}}
                      onPress={() => toggleGroup(id)}>
                      <CloseChipIcon
                        width={20}
                        height={20}
                        color={color.brand40}
                      />
                    </ChipCloseButton>
                  </SelectedChip>
                );
              })}
            </SelectedChipRow>
          )}
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
                        <ProvinceLabel>{province.label}</ProvinceLabel>
                      </ProvinceItem>
                    );
                  })}
                </ProvinceColumn>
                <GroupColumn
                  showsVerticalScrollIndicator={false}
                  persistentScrollbar={false}>
                  {activeProvince?.groups.map(group => {
                    const isSelected = selectedGroupIds.includes(group.id);
                    return (
                      <GroupItem
                        key={group.id}
                        elementName="interested_region_group_item"
                        logParams={{group_id: group.id}}
                        onPress={() => toggleGroup(group.id)}
                        selected={isSelected}>
                        <GroupLabel>{group.label}</GroupLabel>
                        {isSelected && (
                          <CheckColoredIcon width={24} height={24} />
                        )}
                      </GroupItem>
                    );
                  })}
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

// Figma 1648:38851 기준 sheet body 658px (sheet 총 694 - header 36).
// BottomBar(약 88px = pt16 + button56 + pb16)를 빼면 본문 영역 약 570px.
// 본문 fixed height로 잡아서 chip row가 등장해도 sheet 전체 높이가 유지되고
// TwoColumnContainer만 좁아지도록 한다.
const ContentsContainer = styled.View`
  height: 570px;
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

// Figma 1648:38927: 상단 선택된 chip row. gap 8, paddingHorizontal 20.
// chip row 자체는 한 줄 — 높이가 컨테이너에 정해진 값이 아닌 chip 내부 컨텐츠로 결정.
const SelectedChipRow = styled.ScrollView`
  margin-top: 16px;
  flex-grow: 0;
`;

const SelectedChip = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  border-width: 1px;
  border-color: ${color.brand40};
  border-radius: 100px;
  padding: 8px 16px;
`;

const SelectedChipLabel = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.brand40};
`;

const ChipCloseButton = styled(SccPressable)`
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
`;

// flex:1로 잡아서 chip row가 추가돼도 시트 전체 높이는 ContentsContainer에 의해
// 고정되고 컬럼 viewport만 줄어들도록 한다. (Figma 1648:38919: 시트 총 694px 유지)
const TwoColumnContainer = styled.View`
  margin-top: 20px;
  flex: 1;
  flex-direction: row;
  border-top-width: 1px;
  border-top-color: ${color.gray15v2};
`;

const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

// Figma: w-[110px], gray15 background (전체 컬럼 배경).
// styled.ScrollView에 width prop이 inner content에 적용되어 외부 박스 폭이 의도대로
// 잡히지 않는 경우가 있어, flexBasis + flexGrow:0 + flexShrink:0로 강제한다.
const ProvinceColumn = styled.ScrollView.attrs({
  contentContainerStyle: {flexGrow: 1},
})`
  flex-basis: 110px;
  flex-grow: 0;
  flex-shrink: 0;
  background-color: ${color.gray15v2};
  border-right-width: 2px;
  border-right-color: ${color.gray10v2};
`;

// active = white bg, inactive = gray15 bg. 폰트는 둘 다 Regular 18/26.
const ProvinceItem = styled(SccPressable)<{active: boolean}>`
  padding: 16px 20px;
  background-color: ${({active}) => (active ? color.white : color.gray15v2)};
`;

const ProvinceLabel = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 17px;
  line-height: 26px;
  letter-spacing: -0.34px;
  color: ${color.gray90v2};
`;

const GroupColumn = styled.ScrollView`
  flex: 1;
  background-color: ${color.white};
`;

// Figma 1648:38975 + 박원 디자이너 수정안 (2026-05-27): 선택된 아이템에 brand10 배경.
const GroupItem = styled(SccPressable)<{selected: boolean}>`
  padding: 16px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${({selected}) =>
    selected ? color.brand10 : 'transparent'};
`;

const GroupLabel = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 17px;
  line-height: 26px;
  letter-spacing: -0.34px;
  color: ${color.gray90v2};
`;

// Figma Button-Docked: pt-16 + button 56 + pb-16 (대칭). SafeArea bottom은
// BottomSheet 컴포넌트의 <SafeAreaView edges=['bottom']>로 별도 처리됨.
const BottomBar = styled.View`
  padding: 16px 20px;
  background-color: ${color.white};
`;
