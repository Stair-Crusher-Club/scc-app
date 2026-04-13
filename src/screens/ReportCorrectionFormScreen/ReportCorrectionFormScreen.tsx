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
  PlaceDoorDirectionTypeDto,
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
import type {FloorFormState} from './sections/FloorCorrectionSection';
import DoorTypeCorrectionSection from './sections/DoorTypeCorrectionSection';
import ElevatorCorrectionSection from './sections/ElevatorCorrectionSection';
import AccessLevelCorrectionSection from './sections/AccessLevelCorrectionSection';
import PhotoCorrectionSection from './sections/PhotoCorrectionSection';

/** 카테고리별로 PA correction 필드 필터링 */
function filterPACorrectionByCategory(
  correction: PlaceAccessibilityCorrectionDto,
  cat: InaccurateInfoCategoryDto,
  finalEntranceUrls: string[],
  finalElevatorUrls: string[],
): PlaceAccessibilityCorrectionDto | undefined {
  switch (cat) {
    case InaccurateInfoCategoryDto.Entrance:
      return {
        stairInfo: correction.stairInfo,
        stairHeightLevel: correction.stairHeightLevel,
        hasSlope: correction.hasSlope,
        entranceDoorTypes: correction.entranceDoorTypes,
        doorDirectionType: correction.doorDirectionType,
        entranceImageUrls:
          finalEntranceUrls.length > 0 ? finalEntranceUrls : undefined,
      };
    case InaccurateInfoCategoryDto.Floor:
      return {
        floors: correction.floors,
        floorMovingMethodTypes: correction.floorMovingMethodTypes,
      };
    case InaccurateInfoCategoryDto.DoorType:
      return {
        entranceDoorTypes: correction.entranceDoorTypes,
      };
    case InaccurateInfoCategoryDto.Elevator:
      return {
        elevatorAccessibility: correction.elevatorAccessibility,
        elevatorImageUrls:
          finalElevatorUrls.length > 0 ? finalElevatorUrls : undefined,
      };
    case InaccurateInfoCategoryDto.AccessLevel:
      return {
        stairInfo: correction.stairInfo,
        stairHeightLevel: correction.stairHeightLevel,
      };
    case InaccurateInfoCategoryDto.Photo:
      return {
        entranceImageUrls:
          finalEntranceUrls.length > 0 ? finalEntranceUrls : undefined,
        elevatorImageUrls:
          finalElevatorUrls.length > 0 ? finalElevatorUrls : undefined,
      };
    case InaccurateInfoCategoryDto.Other:
      return undefined;
    default: {
      const _exhaustiveCheck: never = cat;
      return _exhaustiveCheck;
    }
  }
}

/** 카테고리별로 BA correction 필드 필터링 */
function filterBACorrectionByCategory(
  correction: BuildingAccessibilityCorrectionDto,
  cat: InaccurateInfoCategoryDto,
  finalBaEntranceUrls: string[],
  finalBaElevatorUrls: string[],
): BuildingAccessibilityCorrectionDto | undefined {
  switch (cat) {
    case InaccurateInfoCategoryDto.Entrance:
      return {
        entranceStairInfo: correction.entranceStairInfo,
        entranceStairHeightLevel: correction.entranceStairHeightLevel,
        hasSlope: correction.hasSlope,
        entranceDoorTypes: correction.entranceDoorTypes,
        entranceImageUrls:
          finalBaEntranceUrls.length > 0 ? finalBaEntranceUrls : undefined,
      };
    case InaccurateInfoCategoryDto.Elevator:
      return {
        hasElevator: correction.hasElevator,
        elevatorAccessibility: correction.elevatorAccessibility,
        elevatorImageUrls:
          finalBaElevatorUrls.length > 0 ? finalBaElevatorUrls : undefined,
      };
    case InaccurateInfoCategoryDto.Photo:
      return {
        entranceImageUrls:
          finalBaEntranceUrls.length > 0 ? finalBaEntranceUrls : undefined,
        elevatorImageUrls:
          finalBaElevatorUrls.length > 0 ? finalBaElevatorUrls : undefined,
      };
    case InaccurateInfoCategoryDto.Floor:
    case InaccurateInfoCategoryDto.DoorType:
    case InaccurateInfoCategoryDto.AccessLevel:
    case InaccurateInfoCategoryDto.Other:
      return undefined;
    default: {
      const _exhaustiveCheck: never = cat;
      return _exhaustiveCheck;
    }
  }
}

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

  // BA (Building Accessibility) photo state
  const [newBaEntrancePhotos, setNewBaEntrancePhotos] = useState<ImageFile[]>(
    [],
  );
  const [newBaElevatorPhotos, setNewBaElevatorPhotos] = useState<ImageFile[]>(
    [],
  );
  const [deletedBaEntrancePhotoIndices, setDeletedBaEntrancePhotoIndices] =
    useState<number[]>([]);
  const [deletedBaElevatorPhotoIndices, setDeletedBaElevatorPhotoIndices] =
    useState<number[]>([]);
  const [replacedBaEntrancePhotos, setReplacedBaEntrancePhotos] = useState<
    Map<number, ImageFile>
  >(new Map());
  const [replacedBaElevatorPhotos, setReplacedBaElevatorPhotos] = useState<
    Map<number, ImageFile>
  >(new Map());

  // Access level state
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<
    number | undefined
  >(undefined);

  // Floor form state (for submit validation)
  const [floorFormState, setFloorFormState] = useState<FloorFormState | null>(
    null,
  );

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
        elevatorAccessibility: ba.hasElevator
          ? {
              stairInfo: ba.elevatorStairInfo,
              stairHeightLevel: ba.elevatorStairHeightLevel,
              hasSlope: ba.elevatorHasSlope,
            }
          : undefined,
      };
      setBuildingCorrection(baCorrection);
      initialBuildingCorrectionRef.current = baCorrection;
    }
    setIsLoading(false);
  }, [placeId, queryClient, navigation]);

  // BA photos are needed when place entrance is inside building (not standalone)
  const needsBaPhotos = useMemo(
    () =>
      !accessibilityData?.placeAccessibility?.isStandaloneBuilding &&
      accessibilityData?.placeAccessibility?.doorDirectionType ===
        PlaceDoorDirectionTypeDto.InsideBuilding,
    [accessibilityData],
  );

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
      newBaEntrancePhotos.length > 0 ||
      newBaElevatorPhotos.length > 0 ||
      deletedBaEntrancePhotoIndices.length > 0 ||
      deletedBaElevatorPhotoIndices.length > 0 ||
      replacedBaEntrancePhotos.size > 0 ||
      replacedBaElevatorPhotos.size > 0 ||
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
    newBaEntrancePhotos,
    newBaElevatorPhotos,
    deletedBaEntrancePhotoIndices,
    deletedBaElevatorPhotoIndices,
    replacedBaEntrancePhotos,
    replacedBaElevatorPhotos,
    selectedAccessLevel,
    accessibilityData,
  ]);

  // 기존에 사진이 있었는데 모두 삭제되면 제출 불가
  // 단, 엘리베이터를 "없음"으로 교정한 경우 사진이 0장이어도 violation 아님
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

    // 엘리베이터를 "없음"으로 교정하면 (elevatorAccessibility === undefined)
    // 사진이 불필요하므로 violation이 아님
    const correctedHasElevator =
      placeCorrection.elevatorAccessibility !== undefined;
    const elevatorViolation =
      correctedHasElevator &&
      existingElevatorUrls.length > 0 &&
      finalElevatorCount === 0;

    return entranceViolation || elevatorViolation;
  }, [
    accessibilityData,
    deletedEntrancePhotoIndices,
    deletedElevatorPhotoIndices,
    newEntrancePhotos,
    newElevatorPhotos,
    placeCorrection.elevatorAccessibility,
  ]);

  const submitMutation = usePost(
    ['ReportCorrectionForm', 'Submit'],
    async () => {
      // 1. Upload new PA photos and replaced PA photos
      const uploadedEntranceUrls =
        newEntrancePhotos.length > 0
          ? await ImageFileUtils.uploadImages(api, newEntrancePhotos)
          : [];
      const uploadedElevatorUrls =
        newElevatorPhotos.length > 0
          ? await ImageFileUtils.uploadImages(api, newElevatorPhotos)
          : [];

      // Upload replaced PA entrance photos
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

      // Upload replaced PA elevator photos
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

      // 1b. Upload BA photos (only if needsBaPhotos)
      const uploadedBaEntranceUrls =
        needsBaPhotos && newBaEntrancePhotos.length > 0
          ? await ImageFileUtils.uploadImages(api, newBaEntrancePhotos)
          : [];
      const uploadedBaElevatorUrls =
        needsBaPhotos && newBaElevatorPhotos.length > 0
          ? await ImageFileUtils.uploadImages(api, newBaElevatorPhotos)
          : [];

      // Upload replaced BA entrance photos
      const replacedBaEntranceEntries = Array.from(
        replacedBaEntrancePhotos.entries(),
      );
      const uploadedReplacedBaEntranceUrls =
        needsBaPhotos && replacedBaEntranceEntries.length > 0
          ? await ImageFileUtils.uploadImages(
              api,
              replacedBaEntranceEntries.map(([_, photo]) => photo),
            )
          : [];
      const replacedBaEntranceUrlMap = new Map<number, string>();
      replacedBaEntranceEntries.forEach(([idx], i) => {
        replacedBaEntranceUrlMap.set(idx, uploadedReplacedBaEntranceUrls[i]);
      });

      // Upload replaced BA elevator photos
      const replacedBaElevatorEntries = Array.from(
        replacedBaElevatorPhotos.entries(),
      );
      const uploadedReplacedBaElevatorUrls =
        needsBaPhotos && replacedBaElevatorEntries.length > 0
          ? await ImageFileUtils.uploadImages(
              api,
              replacedBaElevatorEntries.map(([_, photo]) => photo),
            )
          : [];
      const replacedBaElevatorUrlMap = new Map<number, string>();
      replacedBaElevatorEntries.forEach(([idx], i) => {
        replacedBaElevatorUrlMap.set(idx, uploadedReplacedBaElevatorUrls[i]);
      });

      // 2. Build final PA photo URL lists (existing with replacements - deleted + new)
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

      // 2b. Build final BA photo URL lists
      const finalBaEntranceUrls = needsBaPhotos
        ? baEntranceImageUrls
            .map((url, idx) => {
              if (deletedBaEntrancePhotoIndices.includes(idx)) {
                return null;
              }
              return replacedBaEntranceUrlMap.get(idx) ?? url;
            })
            .filter((url): url is string => url !== null)
            .concat(uploadedBaEntranceUrls)
        : [];
      const finalBaElevatorUrls = needsBaPhotos
        ? baElevatorImageUrls
            .map((url, idx) => {
              if (deletedBaElevatorPhotoIndices.includes(idx)) {
                return null;
              }
              return replacedBaElevatorUrlMap.get(idx) ?? url;
            })
            .filter((url): url is string => url !== null)
            .concat(uploadedBaElevatorUrls)
        : [];

      const allPhotoUrls = [
        ...finalEntranceUrls,
        ...finalElevatorUrls,
        ...finalBaEntranceUrls,
        ...finalBaElevatorUrls,
      ];

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

      // 4. 카테고리별로 관련 필드만 필터링하여 전송
      const filteredPlaceCorrection = filterPACorrectionByCategory(
        finalPlaceCorrection,
        category,
        finalEntranceUrls,
        finalElevatorUrls,
      );
      const filteredBuildingCorrection = filterBACorrectionByCategory(
        buildingCorrection,
        category,
        finalBaEntranceUrls,
        finalBaElevatorUrls,
      );

      await api.reportAccessibilityPost({
        placeId,
        placeAccessibilityId: accessibilityData?.placeAccessibility?.id,
        buildingAccessibilityId: accessibilityData?.buildingAccessibility?.id,
        targetType: ReportTargetTypeDto.PlaceAccessibility,
        reason: 'INACCURATE_INFO',
        detail: noteText || undefined,
        correction: {
          inaccurateCategories: [category],
          placeAccessibilityCorrection: filteredPlaceCorrection,
          buildingAccessibilityCorrection: filteredBuildingCorrection,
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

  const isSubmitDisabled = useMemo(() => {
    if (!hasChanges || submitMutation.isPending || hasPhotoViolation) {
      return true;
    }

    // FLOOR 카테고리: 층간이동 필수인 경우 체크
    if (category === InaccurateInfoCategoryDto.Floor && floorFormState) {
      if (
        floorFormState.conditions.showFloorMovement &&
        !placeCorrection.floorMovingMethodTypes?.length
      ) {
        return true;
      }
    }

    // ELEVATOR 카테고리: 엘리베이터 있음인데 세부 정보 미선택
    if (category === InaccurateInfoCategoryDto.Elevator) {
      const ea = placeCorrection.elevatorAccessibility;
      if (ea !== undefined) {
        if (!ea.stairInfo || ea.stairInfo === StairInfo.Undefined) {
          return true;
        }
        if (ea.hasSlope === undefined || ea.hasSlope === null) {
          return true;
        }
      }
    }

    return false;
  }, [
    hasChanges,
    submitMutation.isPending,
    hasPhotoViolation,
    category,
    floorFormState,
    placeCorrection.floorMovingMethodTypes,
    placeCorrection.elevatorAccessibility,
  ]);

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

  // BA photo handlers
  const handleDeleteExistingBaEntrancePhoto = useCallback((index: number) => {
    setDeletedBaEntrancePhotoIndices(prev => [...prev, index]);
    setReplacedBaEntrancePhotos(prev => {
      const next = new Map(prev);
      next.delete(index);
      return next;
    });
  }, []);

  const handleDeleteExistingBaElevatorPhoto = useCallback((index: number) => {
    setDeletedBaElevatorPhotoIndices(prev => [...prev, index]);
    setReplacedBaElevatorPhotos(prev => {
      const next = new Map(prev);
      next.delete(index);
      return next;
    });
  }, []);

  const handleReplaceExistingBaEntrancePhoto = useCallback(
    (index: number, photo: ImageFile) => {
      setReplacedBaEntrancePhotos(prev => new Map(prev).set(index, photo));
    },
    [],
  );

  const handleReplaceExistingBaElevatorPhoto = useCallback(
    (index: number, photo: ImageFile) => {
      setReplacedBaElevatorPhotos(prev => new Map(prev).set(index, photo));
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

  // BA image URLs (from BuildingAccessibility)
  const baEntranceImageUrls =
    accessibilityData?.buildingAccessibility?.entranceImages?.map(
      img => img.imageUrl,
    ) ?? [];
  const baElevatorImageUrls =
    accessibilityData?.buildingAccessibility?.elevatorImages?.map(
      img => img.imageUrl,
    ) ?? [];

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
              needsBaPhotos={needsBaPhotos}
              existingBaEntrancePhotoUrls={baEntranceImageUrls}
              newBaEntrancePhotos={newBaEntrancePhotos}
              deletedBaEntrancePhotoIndices={deletedBaEntrancePhotoIndices}
              replacedBaEntrancePhotos={replacedBaEntrancePhotos}
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
              onDeleteExistingBaEntrancePhoto={
                handleDeleteExistingBaEntrancePhoto
              }
              onReplaceExistingBaEntrancePhoto={
                handleReplaceExistingBaEntrancePhoto
              }
              onChangeNewBaEntrancePhotos={setNewBaEntrancePhotos}
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
              onStateChange={setFloorFormState}
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
              needsBaPhotos={needsBaPhotos}
              existingBaElevatorPhotoUrls={baElevatorImageUrls}
              newBaElevatorPhotos={newBaElevatorPhotos}
              deletedBaElevatorPhotoIndices={deletedBaElevatorPhotoIndices}
              replacedBaElevatorPhotos={replacedBaElevatorPhotos}
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
                      elevatorAccessibility: {
                        stairInfo: value.stairInfo,
                        stairHeightLevel: value.stairHeightLevel,
                        hasSlope: value.hasSlope,
                      },
                    };
                  } else {
                    const {elevatorAccessibility, ...rest} = prev;
                    return {...rest, hasElevator: false};
                  }
                });
              }}
              onDeleteExistingElevatorPhoto={handleDeleteExistingElevatorPhoto}
              onReplaceExistingElevatorPhoto={
                handleReplaceExistingElevatorPhoto
              }
              onChangeNewElevatorPhotos={setNewElevatorPhotos}
              onDeleteExistingBaElevatorPhoto={
                handleDeleteExistingBaElevatorPhoto
              }
              onReplaceExistingBaElevatorPhoto={
                handleReplaceExistingBaElevatorPhoto
              }
              onChangeNewBaElevatorPhotos={setNewBaElevatorPhotos}
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
              needsBaPhotos={needsBaPhotos}
              baEntranceImageUrls={baEntranceImageUrls}
              baElevatorImageUrls={baElevatorImageUrls}
              newBaEntrancePhotos={newBaEntrancePhotos}
              newBaElevatorPhotos={newBaElevatorPhotos}
              deletedBaEntrancePhotoIndices={deletedBaEntrancePhotoIndices}
              deletedBaElevatorPhotoIndices={deletedBaElevatorPhotoIndices}
              replacedBaEntrancePhotos={replacedBaEntrancePhotos}
              replacedBaElevatorPhotos={replacedBaElevatorPhotos}
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
              onDeleteExistingBaEntrancePhoto={
                handleDeleteExistingBaEntrancePhoto
              }
              onDeleteExistingBaElevatorPhoto={
                handleDeleteExistingBaElevatorPhoto
              }
              onReplaceExistingBaEntrancePhoto={
                handleReplaceExistingBaEntrancePhoto
              }
              onReplaceExistingBaElevatorPhoto={
                handleReplaceExistingBaElevatorPhoto
              }
              onChangeNewBaEntrancePhotos={setNewBaEntrancePhotos}
              onChangeNewBaElevatorPhotos={setNewBaElevatorPhotos}
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
            isDisabled={isSubmitDisabled}
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
