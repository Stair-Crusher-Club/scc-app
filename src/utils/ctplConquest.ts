import {ContributedChallengeInfoDto} from '@/generated-sources/openapi';

export interface CtplConquest {
  challengeId: string;
  brandName: string;
  /** 이번 등록으로 정복한 순번 (예: 3번째). */
  order: number;
  /** CTPL 전체 장소 수 (예: 240개). */
  total: number;
}

/**
 * PA 등록 응답의 contributedChallengeInfos 에서 CTPL(정복 대상 장소 목록)과 엮인
 * 챌린지 기여를 찾아 정복 완료 축하 화면에 필요한 값을 뽑는다.
 *
 * 신규 API 호출 없음 — 값은 이미 등록 응답의 ChallengeDto 안에 있다
 * (challenge.contributionsCount 는 PA insert 뒤 갱신된 값, challenge.goal 은
 * CTPL 장소 수와 동기화된 값).
 */
export function getCtplConquest(
  infos?: ContributedChallengeInfoDto[],
): CtplConquest | undefined {
  const info = infos?.find(i => i.challenge.conquerTargetPlaceList != null);
  const ctpl = info?.challenge.conquerTargetPlaceList;
  if (!info || !ctpl) {
    return undefined;
  }
  return {
    challengeId: info.challenge.id,
    brandName: ctpl.displayName,
    order: info.challenge.contributionsCount,
    total: info.challenge.goal,
  };
}
