import {ContributedChallengeInfoDto} from '@/generated-sources/openapi';

export interface CtplConquest {
  challengeId: string;
  brandName: string;
  /** 이번 등록으로 정복한 순번 (예: 3번째). */
  order: number;
  /** CTPL 전체 장소 수 (예: 240개). */
  total: number;
  /** 정복 도장 로티 원격 URL. 없으면 앱 내장 기본 로티를 쓴다. */
  stampAnimationUrl?: string;
  /** 제목의 브랜드명 강조색. 없거나 hex 형식이 아니면 앱 내장 기본색을 쓴다. */
  brandColor?: string;
}

/** 3자리/6자리 hex 만 통과. 서버 값이 그대로 스타일로 들어가므로 형식을 좁힌다. */
const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * PA 등록 응답의 contributedChallengeInfos 에서 CTPL(정복 대상 장소 목록)과 엮인
 * 챌린지 기여를 찾아 정복 완료 축하 화면에 필요한 값을 뽑는다.
 *
 * 신규 API 호출 없음 — 값은 이미 등록 응답의 ChallengeDto 안에 있다
 * (challenge.contributionsCount 는 PA insert 뒤 갱신된 값, challenge.goal 은
 * CTPL 장소 수와 동기화된 값).
 *
 * 여기 있다는 것 자체가 "참여 중인 CTPL 챌린지의 대상 장소에 PA 를 등록했다" 는
 * 서버 판정이다(ChallengeService.isContributionTarget + findInProgressByUserId).
 * "첫 정복인가" 는 별개 조건이라 호출처가 isFirstPlaceAccessibility 로 판단한다.
 */
export function getCtplConquest(
  infos?: ContributedChallengeInfoDto[],
): CtplConquest | undefined {
  const info = infos?.find(i => i.challenge.conquerTargetPlaceList != null);
  const ctpl = info?.challenge.conquerTargetPlaceList;
  if (!info || !ctpl) {
    return undefined;
  }
  const celebration = ctpl.celebration;
  const brandColor = celebration?.brandColor;
  return {
    challengeId: info.challenge.id,
    brandName: ctpl.displayName,
    order: info.challenge.contributionsCount,
    total: info.challenge.goal,
    stampAnimationUrl: celebration?.stampAnimationUrl ?? undefined,
    brandColor:
      brandColor && HEX_COLOR_PATTERN.test(brandColor) ? brandColor : undefined,
  };
}
