import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {Dimensions, ScrollView, Text} from 'react-native';
import styled from 'styled-components/native';

import InfoIcon from '@/assets/icon/ic_info.svg';
import PositionedModal from '@/components/PositionedModal';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import BottomSheet from '@/modals/BottomSheet';
import {
  FilterOptions,
  SortOption,
  filterAtom,
  filterModalStateAtom,
} from '@/screens/SearchScreen/atoms';
import ChipSelector from '@/screens/SearchScreen/modals/ChipSelector';
import ScoreSelector from '@/screens/SearchScreen/modals/ScoreSelector.tsx';

const {height} = Dimensions.get('window');

// TODO: 가까운 순 선택 시 위치권한이 없으면 설정으로 이동하는 BottomSheet 를 보여준다.
export default function FilterModal() {
  const [savedFilter, setSavedFilter] = useAtom(filterAtom);
  const [state, setFilterModalState] = useAtom(filterModalStateAtom);

  const [draftSortOption, setDraftSortOption] =
    useState<FilterOptions['sortOption']>();
  const [draftHasSlope, setDraftHasSlope] =
    useState<FilterOptions['hasSlope']>();
  const [draftScoreUnder, setDraftScoreUnder] =
    useState<FilterOptions['scoreUnder']>();
  const [draftIsRegistered, setDraftIsRegistered] =
    useState<FilterOptions['isRegistered']>();

  const sortOption =
    draftSortOption === undefined ? savedFilter.sortOption : draftSortOption;
  const hasSlope =
    draftHasSlope === undefined ? savedFilter.hasSlope : draftHasSlope;
  const scoreUnder =
    draftScoreUnder === undefined ? savedFilter.scoreUnder : draftScoreUnder;
  const isRegistered =
    draftIsRegistered === undefined
      ? savedFilter.isRegistered
      : draftIsRegistered;

  const saveFilter = () => {
    setSavedFilter({
      sortOption,
      hasSlope,
      scoreUnder,
      isRegistered,
    });
    setFilterModalState(null);
  };
  const reset = () => {
    setDraftSortOption(undefined);
    setDraftHasSlope(undefined);
    setDraftScoreUnder(undefined);
    setDraftIsRegistered(undefined);
    setSavedFilter({
      sortOption: SortOption.ACCURACY,
      hasSlope: null,
      scoreUnder: null,
      isRegistered: null,
    });
  };

  return (
    <BottomSheet
      isVisible={state !== null}
      onPressBackground={() => {
        setFilterModalState(null);
      }}>
      <ScrollView
        bounces={false}
        style={{
          maxHeight: (height * 80) / 100,
        }}
        contentContainerStyle={{
          gap: 36,
          paddingVertical: 24,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
        {(state === 'All' || state === 'sortOption') && (
          <FilterItem>
            <FilterLabel>정렬</FilterLabel>
            <ChipSelector
              items={[
                {
                  label: '가까운 순',
                  option: SortOption.DISTANCE,
                  isSelected: sortOption === SortOption.DISTANCE,
                },
                {
                  label: '정확도 순',
                  option: SortOption.ACCURACY,
                  isSelected: sortOption === SortOption.ACCURACY,
                },
                {
                  label: '접근레벨 낮은 순',
                  option: SortOption.LOW_SCORE,
                  isSelected: sortOption === SortOption.LOW_SCORE,
                },
              ]}
              onPress={option => {
                setDraftSortOption(option);
              }}
            />
          </FilterItem>
        )}
        {(state === 'All' || state === 'scoreUnder') && (
          <>
            <FilterItem>
              <LabelIconArea>
                <FilterLabel>접근레벨</FilterLabel>
                <PositionedModal
                  modalContent={
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: font.pretendardMedium,
                        color: color.white,
                      }}>
                      레벨이 낮을 수록 매장 입구 접근이 쉬워요.
                    </Text>
                  }>
                  <InfoIcon width={16} height={16} color={color.gray30} />
                </PositionedModal>
              </LabelIconArea>
              <ScoreSelector
                score={draftScoreUnder}
                onChange={score => {
                  setDraftScoreUnder(score);
                }}
              />
            </FilterItem>
          </>
        )}
        {(state === 'All' || state === 'hasSlope') && (
          <FilterItem>
            <FilterLabel>경사로 유무</FilterLabel>
            <ChipSelector
              items={[
                {
                  label: '전체',
                  option: null,
                  isSelected: hasSlope === null,
                },
                {
                  label: '경사로 있음',
                  option: true,
                  isSelected: hasSlope === true,
                },
                {
                  label: '경사로 없음',
                  option: false,
                  isSelected: hasSlope === false,
                },
              ]}
              onPress={option => {
                setDraftHasSlope(option);
                setDraftHasSlope(option);
              }}
            />
          </FilterItem>
        )}
        {(state === 'All' || state === 'isRegistered') && (
          <FilterItem>
            <FilterLabel>정복 여부</FilterLabel>
            <ChipSelector
              items={[
                {
                  label: '전체',
                  option: null,
                  isSelected: isRegistered === null,
                },
                {
                  label: '정복완료만 보기',
                  option: true,
                  isSelected: isRegistered === true,
                },
                {
                  label: '정복 안된 곳만 보기',
                  option: false,
                  isSelected: isRegistered === false,
                },
              ]}
              onPress={option => {
                setDraftIsRegistered(option);
              }}
            />
          </FilterItem>
        )}
      </ScrollView>
      <Divider />
      <ButtonBox>
        {state === 'All' && (
          <SccButton
            text={'초기화'}
            textColor="black"
            buttonColor="white"
            borderColor="gray20"
            fontFamily={font.pretendardMedium}
            style={{flexGrow: 0, paddingHorizontal: 20}}
            onPress={() => {
              reset();
            }}
          />
        )}
        <SccButton
          text={'결과보기'}
          textColor="white"
          buttonColor="brandColor"
          fontFamily={font.pretendardMedium}
          style={{flexGrow: 1}}
          onPress={() => {
            saveFilter();
          }}
        />
      </ButtonBox>
    </BottomSheet>
  );
}

const ButtonBox = styled.View`
  padding-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 10px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

const FilterItem = styled.View`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
`;

const FilterLabel = styled.Text`
  font-size: 16px;
  font-family: ${() => font.pretendardBold};
  color: ${() => color.black};
`;

const Divider = styled.View`
  width: 100%;
  height: 1px;
  background-color: ${() => color.gray20};
`;

const LabelIconArea = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;
