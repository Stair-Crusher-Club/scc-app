import {useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, ScrollView} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import TextArea from '@/components/form/TextArea';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityInfoV2Dto,
  InaccurateInfoCategoryDto,
  PlaceAccessibilityCorrectionDto,
  BuildingAccessibilityCorrectionDto,
  ReportTargetTypeDto,
  StairInfo,
  StairHeightLevel,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import usePost from '@/hooks/usePost';
import ImageFile from '@/models/ImageFile';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ImageFileUtils from '@/utils/ImageFileUtils';
import ToastUtils from '@/utils/ToastUtils';

import EntranceCorrectionSection from './sections/EntranceCorrectionSection';
import FloorCorrectionSection from './sections/FloorCorrectionSection';
import DoorTypeCorrectionSection from './sections/DoorTypeCorrectionSection';
import ElevatorCorrectionSection from './sections/ElevatorCorrectionSection';
import AccessLevelCorrectionSection from './sections/AccessLevelCorrectionSection';
import PhotoCorrectionSection from './sections/PhotoCorrectionSection';

/** Access level (0-5) → stairInfo + stairHeightLevel 역매핑 */
function accessLevelToStairFields(level: number): {
  stairInfo: StairInfo;
  stairHeightLevel?: StairHeightLevel;
} {
  switch (level) {
    case 0:
      return {stairInfo: StairInfo.None};
    case 1:
      return {
        stairInfo: StairInfo.One,
        stairHeightLevel: StairHeightLevel.HalfThumb,
      };
    case 2:
      return {
        stairInfo: StairInfo.One,
        stairHeightLevel: StairHeightLevel.Thumb,
      };
    case 3:
      return {
        stairInfo: StairInfo.One,
        stairHeightLevel: StairHeightLevel.OverThumb,
      };
    case 4:
      return {stairInfo: StairInfo.TwoToFive};
    case 5:
      return {stairInfo: StairInfo.OverSix};
    default:
      return {stairInfo: StairInfo.Undefined};
  }
}

/** stairInfo + stairHeightLevel → access level (0-5) 순매핑 */
function stairFieldsToAccessLevel(
  stairInfo?: StairInfo,
  stairHeightLevel?: StairHeightLevel,
): number | undefined {
  if (!stairInfo || stairInfo === StairInfo.Undefined) {
    return undefined;
  }
  switch (stairInfo) {
    case StairInfo.None:
      return 0;
    case StairInfo.One:
      switch (stairHeightLevel) {
        case StairHeightLevel.HalfThumb:
          return 1;
        case StairHeightLevel.Thumb:
          return 2;
        case StairHeightLevel.OverThumb:
          return 3;
        default:
          return 1;
      }
    case StairInfo.TwoToFive:
      return 4;
    case StairInfo.OverSix:
      return 5;
    default:
      return undefined;
  }
}

export interface ReportCorrectionFormScreenParams {
  placeId: string;
  inaccurateCategory: string;
  onSubmitSuccess?: () => void;
}

export default function ReportCorrectionFormScreen({
  route,
  navigation,
}: ScreenProps<'ReportCorrectionForm'>) {
  const {placeId, inaccurateCategory, onSubmitSuccess} = route.params;
  const category = inaccurateCategory as InaccurateInfoCategoryDto;
  const {api} = useAppComponents();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(true);
  const [accessibilityData, setAccessibilityData] =
    useState<AccessibilityInfoV2Dto | null>(null);

  const [placeCorrection, setPlaceCorrection] =
    useState<PlaceAccessibilityCorrectionDto>({});
  const [buildingCorrection, setBuildingCorrection] =
    useState<BuildingAccessibilityCorrectionDto>({});
  const [noteText, setNoteText] = useState('');

  // Photo state
  const [newEntrancePhotos, setNewEntrancePhotos] = useState<ImageFile[]>([]);
  const [newElevatorPhotos, setNewElevatorPhotos] = useState<ImageFile[]>([]);
  const [deletedEntrancePhotoIndices, setDeletedEntrancePhotoIndices] =
    useState<number[]>([]);
  const [deletedElevatorPhotoIndices, setDeletedElevatorPhotoIndices] =
    useState<number[]>([]);

  // Replaced photos
  const [replacedEntrancePhotos, setReplacedEntrancePhotos] = useState<
    Map<number, ImageFile>
  >(new Map());
  const [replacedElevatorPhotos, setReplacedElevatorPhotos] = useState<
    Map<number, ImageFile>
  >(new Map());

  // Access level state
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<
    number | undefined
  >(undefined);

  // Refs for initial state (to detect changes)
  const initialPlaceCorrectionRef = useRef<PlaceAccessibilityCorrectionDto>({});
  const initialBuildingCorrectionRef =
    useRef<BuildingAccessibilityCorrectionDto>({});

  useEffect(() => {
    // PDP에서 이미 fetch한 접근성 데이터를 캐시에서 읽어 prefill
    const cached = queryClient.getQueryData<AccessibilityInfoV2Dto>([
      'PlaceDetailV2',
      placeId,
      'Accessibility',
    ]);
    if (!cached) {
      ToastUtils.show('접근성 정보를 불러올 수 없습니다.');
      navigation.goBack();
      return;
    }
    setAccessibilityData(cached);
    const pa = cached.placeAccessibility;
    const ba = cached.buildingAccessibility;

    if (pa) {
      const paCorrection: PlaceAccessibilityCorrectionDto = {
        stairInfo: pa.stairInfo,
        stairHeightLevel: pa.stairHeightLevel,
        hasSlope: pa.hasSlope,
        floors: pa.floors,
        entranceDoorTypes: pa.entranceDoorTypes,
        floorMovingMethodTypes: pa.floorMovingMethodTypes,
        elevatorAccessibility: pa.floorMovingElevatorAccessibility,
        doorDirectionType: pa.doorDirectionType,
      };
      setPlaceCorrection(paCorrection);
      initialPlaceCorrectionRef.current = paCorrection;
    }
    if (ba) {
      const baCorrection: BuildingAccessibilityCorrectionDto = {
        entranceStairInfo: ba.entranceStairInfo,
        entranceStairHeightLevel: ba.entranceStairHeightLevel,
        hasSlope: ba.hasSlope,
        hasElevator: ba.hasElevator,
        entranceDoorTypes: ba.entranceDoorTypes,
        elevatorStairInfo: ba.elevatorStairInfo,
        elevatorStairHeightLevel: ba.elevatorStairHeightLevel,
        elevatorHasSlope: ba.elevatorHasSlope,
      };
      setBuildingCorrection(baCorrection);
      initialBuildingCorrectionRef.current = baCorrection;
    }
    setIsLoading(false);
  }, [placeId, queryClient, navigation]);

  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(placeCorrection) !==
        JSON.stringify(initialPlaceCorrectionRef.current) ||
      JSON.stringify(buildingCorrection) !==
        JSON.stringify(initialBuildingCorrectionRef.current) ||
      noteText !== '' ||
      newEntrancePhotos.length > 0 ||
      newElevatorPhotos.length > 0 ||
      deletedEntrancePhotoIndices.length > 0 ||
      deletedElevatorPhotoIndices.length > 0 ||
      replacedEntrancePhotos.size > 0 ||
      replacedElevatorPhotos.size > 0 ||
      (selectedAccessLevel !== undefined &&
        selectedAccessLevel !==
          stairFieldsToAccessLevel(
            accessibilityData?.placeAccessibility?.stairInfo,
            accessibilityData?.placeAccessibility?.stairHeightLevel,
          ))
    );
  }, [
    placeCorrection,
    buildingCorrection,
    noteText,
    newEntrancePhotos,
    newElevatorPhotos,
    deletedEntrancePhotoIndices,
    deletedElevatorPhotoIndices,
    replacedEntrancePhotos,
    replacedElevatorPhotos,
    selectedAccessLevel,
    accessibilityData,
  ]);

  // 기존에 사진이 있었는데 모두 삭제되면 제출 불가
  const hasPhotoViolation = useMemo(() => {
    const existingEntranceUrls =
      accessibilityData?.placeAccessibility?.imageUrls ?? [];
    const existingElevatorUrls =
      accessibilityData?.placeAccessibility?.floorMovingElevatorAccessibility
        ?.imageUrls ?? [];

    // 최종 입구 사진 수: 삭제 안 된 기존 사진 + 새 사진
    const finalEntranceCount =
      existingEntranceUrls.filter(
        (_, idx) => !deletedEntrancePhotoIndices.includes(idx),
      ).length + newEntrancePhotos.length;

    // 최종 엘리베이터 사진 수: 삭제 안 된 기존 사진 + 새 사진
    const finalElevatorCount =
      existingElevatorUrls.filter(
        (_, idx) => !deletedElevatorPhotoIndices.includes(idx),
      ).length + newElevatorPhotos.length;

    const entranceViolation =
      existingEntranceUrls.length > 0 && finalEntranceCount === 0;
    const elevatorViolation =
      existingElevatorUrls.length > 0 && finalElevatorCount === 0;

    return entranceViolation || elevatorViolation;
  }, [
    accessibilityData,
    deletedEntrancePhotoIndices,
    deletedElevatorPhotoIndices,
    newEntrancePhotos,
    newElevatorPhotos,
  ]);

  const submitMutation = usePost(
    ['ReportCorrectionForm', 'Submit'],
    async () => {
      // 1. Upload new photos and replaced photos
      const uploadedEntranceUrls =
        newEntrancePhotos.length > 0
          ? await ImageFileUtils.uploadImages(api, newEntrancePhotos)
          : [];
      const uploadedElevatorUrls =
        newElevatorPhotos.length > 0
          ? await ImageFileUtils.uploadImages(api, newElevatorPhotos)
          : [];

      // Upload replaced entrance photos
      const replacedEntranceEntries = Array.from(
        replacedEntrancePhotos.entries(),
      );
      const uploadedReplacedEntranceUrls =
        replacedEntranceEntries.length > 0
          ? await ImageFileUtils.uploadImages(
              api,
              replacedEntranceEntries.map(([_, photo]) => photo),
            )
          : [];
      const replacedEntranceUrlMap = new Map<number, string>();
      replacedEntranceEntries.forEach(([idx], i) => {
        replacedEntranceUrlMap.set(idx, uploadedReplacedEntranceUrls[i]);
      });

      // Upload replaced elevator photos
      const replacedElevatorEntries = Array.from(
        replacedElevatorPhotos.entries(),
      );
      const uploadedReplacedElevatorUrls =
        replacedElevatorEntries.length > 0
          ? await ImageFileUtils.uploadImages(
              api,
              replacedElevatorEntries.map(([_, photo]) => photo),
            )
          : [];
      const replacedElevatorUrlMap = new Map<number, string>();
      replacedElevatorEntries.forEach(([idx], i) => {
        replacedElevatorUrlMap.set(idx, uploadedReplacedElevatorUrls[i]);
      });

      // 2. Build final photo URL lists (existing with replacements - deleted + new)
      const finalEntranceUrls = entranceImageUrls
        .map((url, idx) => {
          if (deletedEntrancePhotoIndices.includes(idx)) {
            return null;
          }
          return replacedEntranceUrlMap.get(idx) ?? url;
        })
        .filter((url): url is string => url !== null)
        .concat(uploadedEntranceUrls);
      const finalElevatorUrls = elevatorImageUrls
        .map((url, idx) => {
          if (deletedElevatorPhotoIndices.includes(idx)) {
            return null;
          }
          return replacedElevatorUrlMap.get(idx) ?? url;
        })
        .filter((url): url is string => url !== null)
        .concat(uploadedElevatorUrls);
      const allPhotoUrls = [...finalEntranceUrls, ...finalElevatorUrls];

      // 3. Apply access level to placeCorrection if selected
      let finalPlaceCorrection = {...placeCorrection};
      if (selectedAccessLevel !== undefined) {
        const stairFields = accessLevelToStairFields(selectedAccessLevel);
        finalPlaceCorrection = {
          ...finalPlaceCorrection,
          stairInfo: stairFields.stairInfo,
          stairHeightLevel: stairFields.stairHeightLevel,
        };
      }

      await api.reportAccessibilityPost({
        placeId,
        targetType: ReportTargetTypeDto.PlaceAccessibility,
        reason: 'INACCURATE_INFO',
        detail: noteText || undefined,
        correction: {
          inaccurateCategories: [category],
          placeAccessibilityCorrection: {
            ...finalPlaceCorrection,
            entranceImageUrls:
              finalEntranceUrls.length > 0 ? finalEntranceUrls : undefined,
            elevatorImageUrls:
              finalElevatorUrls.length > 0 ? finalElevatorUrls : undefined,
          },
          buildingAccessibilityCorrection: buildingCorrection,
          noteText: noteText || undefined,
          photoUrls: allPhotoUrls.length > 0 ? allPhotoUrls : undefined,
        },
      });
      // PDP 접근성 데이터를 refetch하도록 캐시 무효화
      await queryClient.invalidateQueries({
        queryKey: ['PlaceDetailV2', placeId],
      });
      ToastUtils.show('신고가 접수되었습니다.');
      onSubmitSuccess?.();
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

  const handleDeleteExistingEntrancePhoto = useCallback((index: number) => {
    setDeletedEntrancePhotoIndices(prev => [...prev, index]);
    // Also remove from replaced if it was replaced
    setReplacedEntrancePhotos(prev => {
      const next = new Map(prev);
      next.delete(index);
      return next;
    });
  }, []);

  const handleDeleteExistingElevatorPhoto = useCallback((index: number) => {
    setDeletedElevatorPhotoIndices(prev => [...prev, index]);
    setReplacedElevatorPhotos(prev => {
      const next = new Map(prev);
      next.delete(index);
      return next;
    });
  }, []);

  const handleReplaceExistingEntrancePhoto = useCallback(
    (index: number, photo: ImageFile) => {
      setReplacedEntrancePhotos(prev => new Map(prev).set(index, photo));
    },
    [],
  );

  const handleReplaceExistingElevatorPhoto = useCallback(
    (index: number, photo: ImageFile) => {
      setReplacedElevatorPhotos(prev => new Map(prev).set(index, photo));
    },
    [],
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

  const entranceImageUrls =
    accessibilityData?.placeAccessibility?.imageUrls ?? [];
  const elevatorImageUrls =
    accessibilityData?.placeAccessibility?.floorMovingElevatorAccessibility
      ?.imageUrls ?? [];

  const renderSection = () => {
    switch (category) {
      case InaccurateInfoCategoryDto.Entrance:
        return (
          <SectionContainer>
            <EntranceCorrectionSection
              stairInfo={placeCorrection.stairInfo}
              stairHeightLevel={placeCorrection.stairHeightLevel}
              hasSlope={placeCorrection.hasSlope}
              doorDirectionType={placeCorrection.doorDirectionType}
              isStandaloneBuilding={
                accessibilityData?.placeAccessibility?.isStandaloneBuilding
              }
              existingEntrancePhotoUrls={entranceImageUrls}
              newEntrancePhotos={newEntrancePhotos}
              deletedEntrancePhotoIndices={deletedEntrancePhotoIndices}
              replacedEntrancePhotos={replacedEntrancePhotos}
              onChangeStairInfo={value => {
                updatePlaceField('stairInfo', value);
                if (value !== StairInfo.One) {
                  updatePlaceField('stairHeightLevel', undefined);
                }
              }}
              onChangeStairHeightLevel={value =>
                updatePlaceField('stairHeightLevel', value)
              }
              onChangeHasSlope={value => updatePlaceField('hasSlope', value)}
              onChangeDoorDirectionType={value =>
                updatePlaceField('doorDirectionType', value)
              }
              onDeleteExistingEntrancePhoto={handleDeleteExistingEntrancePhoto}
              onReplaceExistingEntrancePhoto={
                handleReplaceExistingEntrancePhoto
              }
              onChangeNewEntrancePhotos={setNewEntrancePhotos}
            />
          </SectionContainer>
        );
      case InaccurateInfoCategoryDto.Floor:
        return (
          <SectionContainer>
            <FloorCorrectionSection
              floors={placeCorrection.floors}
              floorMovingMethodTypes={placeCorrection.floorMovingMethodTypes}
              isStandaloneBuilding={
                accessibilityData?.placeAccessibility?.isStandaloneBuilding
              }
              onChangeFloors={value => updatePlaceField('floors', value)}
              onChangeFloorMovingMethodTypes={value =>
                updatePlaceField('floorMovingMethodTypes', value)
              }
            />
          </SectionContainer>
        );
      case InaccurateInfoCategoryDto.DoorType:
        return (
          <SectionContainer>
            <DoorTypeCorrectionSection
              entranceDoorTypes={placeCorrection.entranceDoorTypes}
              onChangeDoorTypes={value =>
                updatePlaceField('entranceDoorTypes', value)
              }
            />
          </SectionContainer>
        );
      case InaccurateInfoCategoryDto.Elevator:
        return (
          <SectionContainer>
            <ElevatorCorrectionSection
              elevatorAccessibility={placeCorrection.elevatorAccessibility}
              existingElevatorPhotoUrls={elevatorImageUrls}
              newElevatorPhotos={newElevatorPhotos}
              deletedElevatorPhotoIndices={deletedElevatorPhotoIndices}
              replacedElevatorPhotos={replacedElevatorPhotos}
              onChangeElevatorAccessibility={value => {
                setPlaceCorrection(prev => ({
                  ...prev,
                  elevatorAccessibility: value,
                }));
                // PA의 elevatorAccessibility 변경을 BA에도 동기화
                setBuildingCorrection(prev => {
                  if (value !== undefined) {
                    return {
                      ...prev,
                      hasElevator: true,
                      elevatorStairInfo: value.stairInfo,
                      elevatorStairHeightLevel: value.stairHeightLevel,
                      elevatorHasSlope: value.hasSlope,
                    };
                  } else {
                    // Remove elevator fields to avoid sending nulls
                    const {
                      elevatorStairInfo,
                      elevatorStairHeightLevel,
                      elevatorHasSlope,
                      ...rest
                    } = prev;
                    return {...rest, hasElevator: false};
                  }
                });
              }}
              onDeleteExistingElevatorPhoto={handleDeleteExistingElevatorPhoto}
              onReplaceExistingElevatorPhoto={
                handleReplaceExistingElevatorPhoto
              }
              onChangeNewElevatorPhotos={setNewElevatorPhotos}
            />
          </SectionContainer>
        );
      case InaccurateInfoCategoryDto.AccessLevel:
        return (
          <SectionContainer>
            <AccessLevelCorrectionSection
              currentLevel={stairFieldsToAccessLevel(
                accessibilityData?.placeAccessibility?.stairInfo,
                accessibilityData?.placeAccessibility?.stairHeightLevel,
              )}
              selectedLevel={selectedAccessLevel}
              onChangeLevel={setSelectedAccessLevel}
            />
          </SectionContainer>
        );
      case InaccurateInfoCategoryDto.Photo:
        return (
          <SectionContainer>
            <PhotoCorrectionSection
              entranceImageUrls={entranceImageUrls}
              elevatorImageUrls={elevatorImageUrls}
              newEntrancePhotos={newEntrancePhotos}
              newElevatorPhotos={newElevatorPhotos}
              deletedEntrancePhotoIndices={deletedEntrancePhotoIndices}
              deletedElevatorPhotoIndices={deletedElevatorPhotoIndices}
              replacedEntrancePhotos={replacedEntrancePhotos}
              replacedElevatorPhotos={replacedElevatorPhotos}
              onDeleteExistingEntrancePhoto={handleDeleteExistingEntrancePhoto}
              onDeleteExistingElevatorPhoto={handleDeleteExistingElevatorPhoto}
              onReplaceExistingEntrancePhoto={
                handleReplaceExistingEntrancePhoto
              }
              onReplaceExistingElevatorPhoto={
                handleReplaceExistingElevatorPhoto
              }
              onChangeNewEntrancePhotos={setNewEntrancePhotos}
              onChangeNewElevatorPhotos={setNewElevatorPhotos}
            />
          </SectionContainer>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenLayout isHeaderVisible={true} isKeyboardAvoidingView={true}>
      <ScrollView
        contentContainerStyle={{paddingHorizontal: 24, paddingBottom: 40}}>
        <PageTitle>올바른 정보를 알려주세요</PageTitle>
        <PageDescription>
          선택한 항목에 대한 올바른 정보를 입력해주세요.
        </PageDescription>

        {renderSection()}

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
            isDisabled={
              !hasChanges || submitMutation.isPending || hasPhotoViolation
            }
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
