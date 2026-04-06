import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import TextArea from '@/components/form/TextArea';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  InaccurateInfoCategoryDto,
  PlaceAccessibilityCorrectionDto,
  BuildingAccessibilityCorrectionDto,
  ReportPrefillResponseDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import usePost from '@/hooks/usePost';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ToastUtils from '@/utils/ToastUtils';

import EntranceCorrectionSection from './sections/EntranceCorrectionSection';
import FloorCorrectionSection from './sections/FloorCorrectionSection';
import DoorTypeCorrectionSection from './sections/DoorTypeCorrectionSection';
import ElevatorCorrectionSection from './sections/ElevatorCorrectionSection';
import AccessLevelCorrectionSection from './sections/AccessLevelCorrectionSection';
import PhotoCorrectionSection from './sections/PhotoCorrectionSection';

export interface ReportCorrectionFormScreenParams {
  placeId: string;
  inaccurateCategories: string[];
}

export default function ReportCorrectionFormScreen({
  route,
  navigation,
}: ScreenProps<'ReportCorrectionForm'>) {
  const {placeId, inaccurateCategories} = route.params;
  const categories = inaccurateCategories as InaccurateInfoCategoryDto[];
  const {api} = useAppComponents();

  const [isLoading, setIsLoading] = useState(true);
  const [prefillData, setPrefillData] =
    useState<ReportPrefillResponseDto | null>(null);

  const [placeCorrection, setPlaceCorrection] =
    useState<PlaceAccessibilityCorrectionDto>({});
  const [buildingCorrection, setBuildingCorrection] =
    useState<BuildingAccessibilityCorrectionDto>({});
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    const loadPrefill = async () => {
      try {
        const response = await api.reportAccessibilityPrefillPost({placeId});
        const data = response.data;
        setPrefillData(data);
        if (data.placeAccessibility) {
          setPlaceCorrection(data.placeAccessibility);
        }
        if (data.buildingAccessibility) {
          setBuildingCorrection(data.buildingAccessibility);
        }
      } catch {
        ToastUtils.show('정보를 불러오는 데 실패했습니다.');
        navigation.goBack();
        return;
      } finally {
        setIsLoading(false);
      }
    };
    loadPrefill();
  }, [api, placeId, navigation]);

  const submitMutation = usePost(
    ['ReportCorrectionForm', 'Submit'],
    async () => {
      await api.reportAccessibilityPost({
        placeId,
        reason: 'INACCURATE_INFO',
        correction: {
          inaccurateCategories: categories,
          placeAccessibilityCorrection: placeCorrection,
          buildingAccessibilityCorrection: buildingCorrection,
          noteText: noteText || undefined,
        },
      });
      ToastUtils.show('신고가 접수되었습니다.');
      navigation.goBack();
    },
  );

  const updatePlaceField = useCallback(
    <K extends keyof PlaceAccessibilityCorrectionDto>(
      key: K,
      value: PlaceAccessibilityCorrectionDto[K],
    ) => {
      setPlaceCorrection(prev => ({...prev, [key]: value}));
    },
    [],
  );

  const hasCategory = useCallback(
    (category: InaccurateInfoCategoryDto): boolean => {
      return categories.includes(category);
    },
    [categories],
  );

  if (isLoading) {
    return (
      <ScreenLayout isHeaderVisible={true} isKeyboardAvoidingView={true}>
        <LoadingContainer>
          <ActivityIndicator size="large" color={color.brandColor} />
        </LoadingContainer>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout isHeaderVisible={true} isKeyboardAvoidingView={true}>
      <ScrollView
        contentContainerStyle={{paddingHorizontal: 24, paddingBottom: 40}}>
        <PageTitle>올바른 정보를 알려주세요</PageTitle>
        <PageDescription>
          선택한 항목에 대한 올바른 정보를 입력해주세요.
        </PageDescription>

        {hasCategory(InaccurateInfoCategoryDto.Entrance) && (
          <SectionContainer>
            <EntranceCorrectionSection
              stairInfo={placeCorrection.stairInfo}
              stairHeightLevel={placeCorrection.stairHeightLevel}
              hasSlope={placeCorrection.hasSlope}
              onChangeStairInfo={value => updatePlaceField('stairInfo', value)}
              onChangeStairHeightLevel={value =>
                updatePlaceField('stairHeightLevel', value)
              }
              onChangeHasSlope={value => updatePlaceField('hasSlope', value)}
            />
          </SectionContainer>
        )}

        {hasCategory(InaccurateInfoCategoryDto.Floor) && (
          <SectionContainer>
            <FloorCorrectionSection
              floors={placeCorrection.floors}
              onChangeFloors={value => updatePlaceField('floors', value)}
            />
          </SectionContainer>
        )}

        {hasCategory(InaccurateInfoCategoryDto.DoorType) && (
          <SectionContainer>
            <DoorTypeCorrectionSection
              entranceDoorTypes={placeCorrection.entranceDoorTypes}
              onChangeDoorTypes={value =>
                updatePlaceField('entranceDoorTypes', value)
              }
            />
          </SectionContainer>
        )}

        {hasCategory(InaccurateInfoCategoryDto.Elevator) && (
          <SectionContainer>
            <ElevatorCorrectionSection
              elevatorAccessibility={placeCorrection.elevatorAccessibility}
              onChangeElevatorAccessibility={value =>
                setPlaceCorrection(prev => ({
                  ...prev,
                  elevatorAccessibility: value,
                }))
              }
            />
          </SectionContainer>
        )}

        {hasCategory(InaccurateInfoCategoryDto.AccessLevel) && (
          <SectionContainer>
            <AccessLevelCorrectionSection />
          </SectionContainer>
        )}

        {hasCategory(InaccurateInfoCategoryDto.Photo) && (
          <SectionContainer>
            <PhotoCorrectionSection
              entranceImageUrls={prefillData?.entranceImageUrls ?? []}
              elevatorImageUrls={prefillData?.elevatorImageUrls ?? []}
            />
          </SectionContainer>
        )}

        <SectionContainer>
          <SectionTitle>부연 설명 (선택)</SectionTitle>
          <TextArea
            placeholder="추가로 설명할 내용이 있다면 입력해주세요."
            value={noteText}
            onChangeText={setNoteText}
          />
        </SectionContainer>

        <SubmitButtonContainer>
          <SccButton
            text="제출하기"
            textColor="white"
            buttonColor="brandColor"
            fontFamily={font.pretendardBold}
            isDisabled={submitMutation.isPending}
            onPress={() => submitMutation.mutate(undefined)}
            elementName="report_correction_submit"
          />
        </SubmitButtonContainer>
      </ScrollView>
    </ScreenLayout>
  );
}

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const PageTitle = styled.Text`
  font-size: 22px;
  font-family: ${font.pretendardBold};
  color: ${color.black};
  margin-top: 24px;
  margin-bottom: 8px;
`;

const PageDescription = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray50};
  margin-bottom: 24px;
`;

const SectionContainer = styled.View`
  margin-bottom: 28px;
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-family: ${font.pretendardBold};
  color: ${color.black};
  margin-bottom: 12px;
`;

const SubmitButtonContainer = styled.View`
  margin-top: 12px;
`;
