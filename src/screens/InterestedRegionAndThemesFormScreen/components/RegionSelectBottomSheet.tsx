import React, {useCallback, useMemo, useState} from 'react';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import BottomSheet from '@/modals/BottomSheet/BottomSheet';

import {REGION_PROVINCES} from '../constants';

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
 */
export default function RegionSelectBottomSheet({
  isVisible,
  initialSelectedGroupIds,
  onConfirm,
  onClose,
}: RegionSelectBottomSheetProps) {
  const [activeProvinceId, setActiveProvinceId] = useState<string>(
    REGION_PROVINCES[0].id,
  );
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    initialSelectedGroupIds,
  );

  // 시트가 열릴 때마다 초기값 동기화
  React.useEffect(() => {
    if (isVisible) {
      setSelectedGroupIds(initialSelectedGroupIds);
      setActiveProvinceId(REGION_PROVINCES[0].id);
    }
  }, [isVisible, initialSelectedGroupIds]);

  const activeProvince = useMemo(
    () =>
      REGION_PROVINCES.find(p => p.id === activeProvinceId) ??
      REGION_PROVINCES[0],
    [activeProvinceId],
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
            <ProvinceColumn
              showsVerticalScrollIndicator={false}
              persistentScrollbar={false}>
              {REGION_PROVINCES.map(province => {
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
              {activeProvince.groups.length === 0 ? (
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
