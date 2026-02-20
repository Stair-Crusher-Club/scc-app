import dayjs from 'dayjs';
import React from 'react';
import {Image, ScrollView} from 'react-native';
import styled from 'styled-components/native';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {doorTypeMap} from '@/constant/options';
import {
  AccessibilityInfoV2Dto,
  Building,
  BuildingDoorDirectionTypeDto,
  Place,
  PlaceAccessibilityComment,
  BuildingAccessibilityComment,
  PlaceDoorDirectionTypeDto,
  PlaceReviewDto,
  ReportTargetTypeDto,
} from '@/generated-sources/openapi';
import {SEAT_TYPE_OPTIONS} from '@/screens/PlaceReviewFormScreen/constants';

import {
  getFloorAccessibility,
  getPlaceEntranceStepType,
  getBuildingEntranceStepType,
  getBuildingElevatorType,
  getStairDescription,
  EntranceStepType,
  ElevatorType,
} from '../components/PlaceInfo.utils';

interface Props {
  accessibility?: AccessibilityInfoV2Dto;
  place: Place;
  building: Building;
  isAccessibilityRegistrable?: boolean;
  reviews?: PlaceReviewDto[];
  onRegister?: () => void;
  showNegativeFeedbackBottomSheet?: (type: ReportTargetTypeDto) => void;
  allowDuplicateRegistration?: boolean;
}

export default function V2AccessibilityTab({
  accessibility,
  reviews = [],
  onRegister,
}: Props) {
  const hasPlaceAccessibility = !!accessibility?.placeAccessibility;
  const hasBuildingAccessibility = !!accessibility?.buildingAccessibility;
  const hasIndoorReviews = reviews.length > 0;

  if (!hasPlaceAccessibility) {
    return (
      <EmptyStateContainer>
        <EmptyStateTextBlock>
          <EmptyStateTitle>
            {'아직 등록된  접근성 정보가 없어요🥲'}
          </EmptyStateTitle>
          <EmptyStateDescription>
            {'아래 버튼을 눌러주시면\n최대한 빨리 장소를 정복해볼게요!'}
          </EmptyStateDescription>
        </EmptyStateTextBlock>
        <EmptyStateCTAButton
          elementName="v2_accessibility_tab_empty_register"
          onPress={onRegister}>
          <PlusIcon width={20} height={20} color={color.brand40} />
          <EmptyStateCTAText>정보 등록하기</EmptyStateCTAText>
        </EmptyStateCTAButton>
      </EmptyStateContainer>
    );
  }

  const placeAccessibility = accessibility!.placeAccessibility!;
  const buildingAccessibility = accessibility?.buildingAccessibility;

  // V2 건물유형 분기 필드
  const isStandalone = placeAccessibility.isStandaloneBuilding === true;
  const doorDir = placeAccessibility.doorDirectionType;
  const floors = placeAccessibility.floors ?? [];
  const isMultiFloor = floors.length > 1;
  const hasV2Fields =
    placeAccessibility.isStandaloneBuilding != null && doorDir != null;

  // 서브탭 칩 목록 생성 (건물유형별 분기)
  const chips: string[] = ['층 정보'];

  if (hasV2Fields) {
    if (isStandalone) {
      // 단독건물: 매장(건물 출입구)
      chips.push('매장(건물 출입구)');
      if (isMultiFloor) {
        chips.push('층간 이동 정보');
      }
      chips.push('내부 이용 정보');
    } else if (doorDir === PlaceDoorDirectionTypeDto.OutsideBuilding) {
      // 비단독 + 외부문
      chips.push('매장 출입구');
      if (isMultiFloor) {
        chips.push('층간 이동 정보');
        chips.push('내부 이용 정보');
      }
    } else {
      // 비단독 + 내부문 (INSIDE_BUILDING)
      chips.push('건물 출입구');
      chips.push('매장 출입구');
      if (isMultiFloor) {
        chips.push('층간 이동 정보');
      }
      chips.push('내부 이용 정보');
    }
  } else {
    // Fallback: V2 필드가 없는 기존 데이터
    if (hasBuildingAccessibility) {
      chips.push('건물 출입구');
    }
    chips.push('매장 출입구');
    if (hasIndoorReviews) {
      chips.push('내부 이용 정보');
    }
  }
  const placeComments = accessibility?.placeAccessibilityComments ?? [];
  const buildingComments = accessibility?.buildingAccessibilityComments ?? [];

  // 층 정보 계산
  // getFloorAccessibility expects AccessibilityInfoDto, which is structurally compatible
  const floorInfo = getFloorAccessibility(accessibility as any);
  const floorDate = dayjs(placeAccessibility.createdAt.value).format(
    'YYYY.MM.DD',
  );

  // 건물 출입구 정보
  const buildingDate = buildingAccessibility
    ? dayjs(
        (buildingAccessibility as any).createdAt?.value ?? Date.now(),
      ).format('YYYY.MM.DD')
    : '';

  // 매장 출입구 정보
  const placeDate = dayjs(placeAccessibility.createdAt.value).format(
    'YYYY.MM.DD',
  );

  return (
    <Container>
      {/* 서브탭 칩 */}
      <ChipScrollContainer>
        <ChipRow>
          {chips.map(chip => (
            <Chip key={chip}>
              <ChipText>{chip}</ChipText>
            </Chip>
          ))}
        </ChipRow>
      </ChipScrollContainer>

      {/* 섹션들 */}
      <SectionsContainer>
        {/* 층 정보 (항상 첫 번째) */}
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>층 정보</SectionTitle>
            <SectionDate>{floorDate}</SectionDate>
          </SectionHeader>
          <InfoRowsContainer>
            <InfoRow
              label="층 정보"
              value={floorInfo.title}
              subValue={floorInfo.description}
            />
          </InfoRowsContainer>
        </SectionContainer>

        {hasV2Fields ? (
          <>
            {isStandalone ? (
              <>
                {/* 단독건물: 매장(건물 출입구) */}
                <PlaceEntranceSection
                  title="매장(건물 출입구)"
                  placeDate={placeDate}
                  placeAccessibility={placeAccessibility}
                  accessibility={accessibility}
                  placeComments={placeComments}
                />
                {isMultiFloor && <FloorMovementSection />}
                <IndoorInfoSection reviews={reviews} />
              </>
            ) : doorDir === PlaceDoorDirectionTypeDto.OutsideBuilding ? (
              <>
                {/* 비단독 + 외부문 */}
                <PlaceEntranceSection
                  title="매장 출입구"
                  placeDate={placeDate}
                  placeAccessibility={placeAccessibility}
                  accessibility={accessibility}
                  placeComments={placeComments}
                />
                {isMultiFloor && (
                  <>
                    <FloorMovementSection />
                    <IndoorInfoSection reviews={reviews} />
                  </>
                )}
              </>
            ) : (
              <>
                {/* 비단독 + 내부문 (INSIDE_BUILDING) */}
                {hasBuildingAccessibility && buildingAccessibility && (
                  <BuildingEntranceSection
                    buildingDate={buildingDate}
                    buildingAccessibility={buildingAccessibility}
                    accessibility={accessibility}
                    buildingComments={buildingComments}
                  />
                )}
                <PlaceEntranceSection
                  title="매장 출입구"
                  placeDate={placeDate}
                  placeAccessibility={placeAccessibility}
                  accessibility={accessibility}
                  placeComments={placeComments}
                />
                {isMultiFloor && <FloorMovementSection />}
                <IndoorInfoSection reviews={reviews} />
              </>
            )}
          </>
        ) : (
          <>
            {/* Fallback: V2 필드 없는 기존 데이터 */}
            {hasBuildingAccessibility && buildingAccessibility && (
              <BuildingEntranceSection
                buildingDate={buildingDate}
                buildingAccessibility={buildingAccessibility}
                accessibility={accessibility}
                buildingComments={buildingComments}
              />
            )}
            <PlaceEntranceSection
              title={
                hasBuildingAccessibility
                  ? '매장 출입구 - 주 출입구'
                  : '매장 출입구'
              }
              placeDate={placeDate}
              placeAccessibility={placeAccessibility}
              accessibility={accessibility}
              placeComments={placeComments}
            />
            {hasIndoorReviews && <IndoorInfoSection reviews={reviews} />}
          </>
        )}
      </SectionsContainer>

      <BottomPadding />
    </Container>
  );
}

// ──────────────── 섹션 컴포넌트 ────────────────

function BuildingEntranceSection({
  buildingDate,
  buildingAccessibility,
  accessibility,
  buildingComments,
}: {
  buildingDate: string;
  buildingAccessibility: NonNullable<
    AccessibilityInfoV2Dto['buildingAccessibility']
  >;
  accessibility?: AccessibilityInfoV2Dto;
  buildingComments: BuildingAccessibilityComment[];
}) {
  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>건물 출입구</SectionTitle>
        <SectionDate>{buildingDate}</SectionDate>
      </SectionHeader>

      <SectionContent>
        <PhotoRow
          images={[
            ...(buildingAccessibility.entranceImages ?? []),
            ...(buildingAccessibility.elevatorImages ?? []),
          ]}
        />
        <InfoRowsContainer>
          <BuildingEntranceInfoRows accessibility={accessibility} />
          <BuildingElevatorInfoRow accessibility={accessibility} />
          <BuildingDoorInfoRow accessibility={accessibility} />
          <BuildingDoorDirectionInfoRow accessibility={accessibility} />
        </InfoRowsContainer>
        {buildingComments.length > 0 && (
          <CommentBox
            comments={buildingComments}
            registeredUserName={buildingAccessibility.registeredUserName}
          />
        )}
      </SectionContent>
    </SectionContainer>
  );
}

function PlaceEntranceSection({
  title,
  placeDate,
  placeAccessibility,
  accessibility,
  placeComments,
}: {
  title: string;
  placeDate: string;
  placeAccessibility: NonNullable<AccessibilityInfoV2Dto['placeAccessibility']>;
  accessibility?: AccessibilityInfoV2Dto;
  placeComments: PlaceAccessibilityComment[];
}) {
  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>{title}</SectionTitle>
        <SectionDate>{placeDate}</SectionDate>
      </SectionHeader>

      <SectionContent>
        <PhotoRow images={placeAccessibility.images ?? []} />
        <InfoRowsContainer>
          <PlaceEntranceInfoRows accessibility={accessibility} />
          <PlaceDoorInfoRow accessibility={accessibility} />
          <PlaceDoorDirectionInfoRow accessibility={accessibility} />
        </InfoRowsContainer>
        {placeComments.length > 0 && (
          <CommentBox
            comments={placeComments}
            registeredUserName={placeAccessibility.registeredUserName}
          />
        )}
      </SectionContent>
    </SectionContainer>
  );
}

function FloorMovementSection() {
  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>층간 이동 정보</SectionTitle>
      </SectionHeader>
      <FloorMovementEmptyContainer>
        <FloorMovementEmptyText>
          아직 등록된 층간 이동 정보가 없어요
        </FloorMovementEmptyText>
      </FloorMovementEmptyContainer>
    </SectionContainer>
  );
}

// ──────────────── 서브 컴포넌트 ────────────────

function InfoRow({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <InfoRowContainer>
      <InfoLabel>{label}</InfoLabel>
      <InfoValueContainer>
        <InfoValue>{value}</InfoValue>
        {subValue ? <InfoSubValue>{subValue}</InfoSubValue> : null}
      </InfoValueContainer>
    </InfoRowContainer>
  );
}

function PhotoRow({images}: {images: Array<{imageUrl: string}>}) {
  if (images.length === 0) {
    return null;
  }
  return (
    <PhotoRowContainer>
      {images.slice(0, 3).map((img, index) => (
        <PhotoThumbnail key={index} source={{uri: img.imageUrl}} />
      ))}
    </PhotoRowContainer>
  );
}

function CommentBox({
  comments,
  registeredUserName,
}: {
  comments: PlaceAccessibilityComment[] | BuildingAccessibilityComment[];
  registeredUserName?: string;
}) {
  // 가장 최신 코멘트만 표시 (또는 등록자 코멘트)
  const latestComment = comments[0];
  if (!latestComment) {
    return null;
  }
  const userName = latestComment.user?.nickname ?? registeredUserName ?? '익명';
  const dateStr = dayjs(latestComment.createdAt.value).format('YYYY.MM.DD');

  return (
    <CommentContainer>
      <CommentText>{latestComment.comment}</CommentText>
      <CommentMetaRow>
        <CommentUserName>{userName}</CommentUserName>
        <CommentDate>{dateStr}</CommentDate>
      </CommentMetaRow>
    </CommentContainer>
  );
}

function BuildingEntranceInfoRows({
  accessibility,
}: {
  accessibility?: AccessibilityInfoV2Dto;
}) {
  if (!accessibility) {
    return null;
  }
  const entranceStepType = getBuildingEntranceStepType(accessibility as any);
  const stairInfo = accessibility.buildingAccessibility?.entranceStairInfo;
  const stairHeight =
    accessibility.buildingAccessibility?.entranceStairHeightLevel;
  const description = getStairDescription(stairHeight, stairInfo);

  let title = '';
  switch (entranceStepType) {
    case EntranceStepType.Flat:
      title = '계단, 경사로 없음';
      break;
    case EntranceStepType.SlopeOnly:
      title = '경사로 있음';
      break;
    case EntranceStepType.StairAndSlope:
      title = '계단과 경사로 있음';
      break;
    case EntranceStepType.StairOnly:
      title = '계단 있음';
      break;
  }

  return <InfoRow label="입구 정보" value={title} subValue={description} />;
}

function BuildingElevatorInfoRow({
  accessibility,
}: {
  accessibility?: AccessibilityInfoV2Dto;
}) {
  if (!accessibility?.buildingAccessibility) {
    return null;
  }
  const elevatorType = getBuildingElevatorType(accessibility as any);
  const stairInfo = accessibility.buildingAccessibility.elevatorStairInfo;
  const stairHeight =
    accessibility.buildingAccessibility.elevatorStairHeightLevel;
  const description = getStairDescription(stairHeight, stairInfo);

  let title = '';
  switch (elevatorType) {
    case ElevatorType.ElevatorAfterStair:
      title = '엘리베이터 있지만,\n가는 길에 계단 있음';
      break;
    case ElevatorType.ElevatorNoBarriers:
      title = '엘리베이터 있음';
      break;
    case ElevatorType.NoElevator:
      title = '엘리베이터 없음';
      break;
  }

  return (
    <InfoRow label="엘리베이터 정보" value={title} subValue={description} />
  );
}

function BuildingDoorInfoRow({
  accessibility,
}: {
  accessibility?: AccessibilityInfoV2Dto;
}) {
  const doorTypes =
    accessibility?.buildingAccessibility?.entranceDoorTypes ?? [];
  if (doorTypes.length === 0) {
    return null;
  }
  const title = doorTypes.map(d => doorTypeMap[d]).join(', ');
  return <InfoRow label="출입문 유형" value={title} />;
}

function BuildingDoorDirectionInfoRow({
  accessibility,
}: {
  accessibility?: AccessibilityInfoV2Dto;
}) {
  const doorDir = accessibility?.buildingAccessibility?.doorDirectionType;
  if (!doorDir) {
    return null;
  }
  let title = '';
  switch (doorDir) {
    case BuildingDoorDirectionTypeDto.RoadDirection:
      title = '지상/보도 연결 문';
      break;
    case BuildingDoorDirectionTypeDto.ParkingDirection:
      title = '주차장 방향';
      break;
    case BuildingDoorDirectionTypeDto.Etc:
      title = '기타';
      break;
  }
  return <InfoRow label="출입구 방향" value={title} />;
}

function PlaceDoorDirectionInfoRow({
  accessibility,
}: {
  accessibility?: AccessibilityInfoV2Dto;
}) {
  const doorDir = accessibility?.placeAccessibility?.doorDirectionType;
  if (!doorDir) {
    return null;
  }
  let title = '';
  switch (doorDir) {
    case PlaceDoorDirectionTypeDto.OutsideBuilding:
      title = '건물 밖';
      break;
    case PlaceDoorDirectionTypeDto.InsideBuilding:
      title = '건물 안';
      break;
  }
  return <InfoRow label="출입구 방향" value={title} />;
}

function PlaceEntranceInfoRows({
  accessibility,
}: {
  accessibility?: AccessibilityInfoV2Dto;
}) {
  if (!accessibility) {
    return null;
  }
  const entranceStepType = getPlaceEntranceStepType(accessibility as any);
  const stairInfo = accessibility.placeAccessibility?.stairInfo;
  const stairHeight = accessibility.placeAccessibility?.stairHeightLevel;
  const description = getStairDescription(stairHeight, stairInfo);

  let title = '';
  switch (entranceStepType) {
    case EntranceStepType.Flat:
      title = '계단, 경사로 없음';
      break;
    case EntranceStepType.SlopeOnly:
      title = '경사로 있음';
      break;
    case EntranceStepType.StairAndSlope:
      title = '계단과 경사로 있음';
      break;
    case EntranceStepType.StairOnly:
      title = '계단 있음';
      break;
  }

  return <InfoRow label="입구 정보" value={title} subValue={description} />;
}

function PlaceDoorInfoRow({
  accessibility,
}: {
  accessibility?: AccessibilityInfoV2Dto;
}) {
  const doorTypes = accessibility?.placeAccessibility?.entranceDoorTypes ?? [];
  if (doorTypes.length === 0) {
    return null;
  }
  const title = doorTypes.map(d => doorTypeMap[d]).join(', ');
  return <InfoRow label="출입문 유형" value={title} />;
}

function IndoorInfoSection({reviews}: {reviews: PlaceReviewDto[]}) {
  if (reviews.length === 0) {
    return null;
  }

  const updatedAt = dayjs(
    Math.max(...reviews.map(r => r.createdAt.value)),
  ).format('YYYY.MM.DD');

  const allSeatTypes = [...new Set(reviews.flatMap(r => r.seatTypes))];
  const seatTypes: string[] = [];
  const seatComments: string[] = [];
  allSeatTypes.forEach(item => {
    if (SEAT_TYPE_OPTIONS.includes(item)) {
      seatTypes.push(item);
    } else {
      seatComments.push(item);
    }
  });

  const orderMethods = [...new Set(reviews.flatMap(r => r.orderMethods))];
  const features = [...new Set(reviews.flatMap(r => r.features))];

  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>내부 이용 정보</SectionTitle>
        <SectionDate>{updatedAt}</SectionDate>
      </SectionHeader>

      <IndoorContent>
        {/* 좌석 구성 */}
        {seatTypes.length > 0 && (
          <IndoorRow>
            <IndoorLabel>좌석 구성</IndoorLabel>
            <IndoorValueContainer>
              <TagWrap>
                {seatTypes.map(t => (
                  <Tag key={t}>
                    <TagText>{t}</TagText>
                  </Tag>
                ))}
              </TagWrap>
              {seatComments.length > 0 && (
                <IndoorDescription>{seatComments.join(', ')}</IndoorDescription>
              )}
            </IndoorValueContainer>
          </IndoorRow>
        )}

        {/* 주문방법 */}
        {orderMethods.length > 0 && (
          <IndoorRow>
            <IndoorLabel>주문방법</IndoorLabel>
            <IndoorValueContainer>
              <TagWrap>
                {orderMethods.map(m => (
                  <Tag key={m}>
                    <TagText>{m}</TagText>
                  </Tag>
                ))}
              </TagWrap>
            </IndoorValueContainer>
          </IndoorRow>
        )}

        {/* 특이사항 */}
        {features.length > 0 && (
          <IndoorRow>
            <IndoorLabel>특이사항</IndoorLabel>
            <IndoorValueContainer>
              <IndoorFeatureText>{features.join(', ')}</IndoorFeatureText>
            </IndoorValueContainer>
          </IndoorRow>
        )}
      </IndoorContent>
    </SectionContainer>
  );
}

// ──────────────── 스타일 ────────────────

const Container = styled.View`
  background-color: ${color.white};
`;

// Empty state
const EmptyStateContainer = styled.View`
  background-color: ${color.gray5};
  padding-top: 40px;
  padding-horizontal: 20px;
  padding-bottom: 20px;
  gap: 16px;
`;

const EmptyStateTextBlock = styled.View`
  gap: 8px;
  align-items: center;
`;

const EmptyStateTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.gray80};
  text-align: center;
`;

const EmptyStateDescription = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 15px;
  line-height: 24px;
  letter-spacing: -0.3px;
  color: ${color.gray50};
  text-align: center;
`;

const EmptyStateCTAButton = styled(SccTouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: ${color.white};
  border-width: 1px;
  border-color: ${color.brand40};
  border-radius: 8px;
  padding-vertical: 12px;
  padding-horizontal: 28px;
`;

const EmptyStateCTAText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.brand40};
`;

// 서브탭 칩
const ChipScrollContainer = styled(ScrollView).attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    paddingHorizontal: 20,
    gap: 8,
  },
})`
  padding-top: 12px;
  padding-bottom: 4px;
`;

const ChipRow = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const Chip = styled.View`
  border-width: 1px;
  border-color: ${color.gray20};
  border-radius: 100px;
  padding-horizontal: 14px;
  padding-vertical: 8px;
  background-color: ${color.white};
`;

const ChipText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.26px;
  color: ${color.gray90};
`;

// 섹션
const SectionsContainer = styled.View`
  padding: 20px;
  gap: 40px;
`;

const SectionContainer = styled.View`
  gap: 16px;
`;

const SectionContent = styled.View`
  gap: 16px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.gray90};
`;

const SectionDate = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.gray50};
`;

// 정보 행
const InfoRowsContainer = styled.View`
  gap: 12px;
`;

const InfoRowContainer = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
`;

const InfoLabel = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.gray50};
  min-height: 26px;
  justify-content: center;
  padding-top: 3px;
`;

const InfoValueContainer = styled.View`
  align-items: flex-end;
  gap: 2px;
`;

const InfoValue = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  line-height: 26px;
  letter-spacing: -0.32px;
  color: ${color.gray90};
  text-align: right;
`;

const InfoSubValue = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.brand50};
`;

// 사진
const PhotoRowContainer = styled.View`
  flex-direction: row;
  gap: 4px;
`;

const PhotoThumbnail = styled(Image)`
  width: 114px;
  height: 114px;
  border-radius: 8px;
  background-color: #d9d9d9;
`;

// 코멘트
const CommentContainer = styled.View`
  background-color: ${color.gray5};
  border-radius: 12px;
  padding: 12px;
  gap: 6px;
`;

const CommentText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 22px;
  letter-spacing: -0.28px;
  color: ${color.gray80};
`;

const CommentMetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const CommentUserName = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.brand50};
`;

const CommentDate = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.gray60};
`;

// 내부 이용 정보
const IndoorContent = styled.View`
  gap: 16px;
`;

const IndoorRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
`;

const IndoorLabel = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.gray40};
  width: 48px;
  padding-top: 4px;
`;

const IndoorValueContainer = styled.View`
  flex: 1;
  gap: 8px;
`;

const TagWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px;
`;

const Tag = styled.View`
  background-color: ${color.gray5};
  border-radius: 6px;
  padding-horizontal: 6px;
  padding-vertical: 4px;
`;

const TagText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.brand50};
`;

const IndoorDescription = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 20px;
  color: ${color.gray90};
`;

const IndoorFeatureText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 22px;
  letter-spacing: -0.28px;
  color: ${color.gray90};
`;

// 층간 이동 정보 빈 상태
const FloorMovementEmptyContainer = styled.View`
  background-color: ${color.gray5};
  border-radius: 12px;
  padding: 20px;
  align-items: center;
  justify-content: center;
`;

const FloorMovementEmptyText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 22px;
  letter-spacing: -0.28px;
  color: ${color.gray50};
`;

const BottomPadding = styled.View`
  height: 100px;
`;
