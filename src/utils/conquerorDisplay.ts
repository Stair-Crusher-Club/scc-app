import type {
  AccessibilityInfoV2Dto,
  BuildingAccessibility,
  ChallengeCrusherGroupDto,
  PlaceAccessibility,
} from '@/generated-sources/openapi';

/**
 * 장소 상세 홈탭의 정복자 표기("정복자 OOO 외 N명")와
 * 챌린지 배너("OO이 계단뿌셔클럽과 함께했어요")가 기준으로 삼는 등록자를 고른다.
 *
 * 기준은 "장소(매장) 접근성 정보를 가장 최근에 등록한 사람"이다.
 * 서버는 목록을 접근 레벨 오름차순으로 내려주므로 여기서 등록 시각 역순으로 다시 정렬한다.
 * 건물 접근성 정보는 장소 정보에 해당 값이 하나도 없을 때만 fallback 으로 쓴다.
 */

type Registration = PlaceAccessibility | BuildingAccessibility;

function sortByRecency<T extends Registration>(items: T[]): T[] {
  return [...items].sort((a, b) => b.createdAt.value - a.createdAt.value);
}

function placeItemsOf(accessibility?: AccessibilityInfoV2Dto) {
  if (accessibility?.placeAccessibilities?.length) {
    return accessibility.placeAccessibilities;
  }
  return accessibility?.placeAccessibility
    ? [accessibility.placeAccessibility]
    : [];
}

function buildingItemsOf(accessibility?: AccessibilityInfoV2Dto) {
  if (accessibility?.buildingAccessibilities?.length) {
    return accessibility.buildingAccessibilities;
  }
  return accessibility?.buildingAccessibility
    ? [accessibility.buildingAccessibility]
    : [];
}

/**
 * 실명 등록자 이름을 중복 없이 최신 등록 순으로 반환한다.
 * 장소 등록자가 앞, 건물 등록자가 뒤. 익명 등록(registeredUserName 없음)은 건너뛴다.
 */
export function getConquerorNamesByRecency(
  accessibility?: AccessibilityInfoV2Dto,
): string[] {
  const ordered = [
    ...sortByRecency(placeItemsOf(accessibility)),
    ...sortByRecency(buildingItemsOf(accessibility)),
  ];
  const names: string[] = [];
  for (const item of ordered) {
    if (item.registeredUserName && !names.includes(item.registeredUserName)) {
      names.push(item.registeredUserName);
    }
  }
  return names;
}

export function formatConquerorText(
  accessibility?: AccessibilityInfoV2Dto,
): string {
  const names = getConquerorNamesByRecency(accessibility);
  if (names.length === 0) {
    return '정복자 익명 비밀요원';
  }
  if (names.length === 1) {
    return `정복자 ${names[0]}`;
  }
  return `정복자 ${names[0]} 외 ${names.length - 1}명`;
}

/**
 * 챌린지 그룹이 붙은 등록 중 가장 최근 것의 그룹을 반환한다.
 * 장소 정보에 없으면 건물 정보에서 같은 방식으로 찾는다.
 */
export function getLatestChallengeCrusherGroup(
  accessibility?: AccessibilityInfoV2Dto,
): ChallengeCrusherGroupDto | undefined {
  const latestWithGroup = (items: Registration[]) =>
    sortByRecency(items).find(item => item.challengeCrusherGroup)
      ?.challengeCrusherGroup;
  return (
    latestWithGroup(placeItemsOf(accessibility)) ??
    latestWithGroup(buildingItemsOf(accessibility))
  );
}
