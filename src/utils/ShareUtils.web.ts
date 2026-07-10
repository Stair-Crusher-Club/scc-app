import type {Place} from '@/generated-sources/openapi';
import ToastUtils from '@/utils/ToastUtils';

const SCC_CONTENT_SHARE_SHORT_ID = 'scc-content';
// 장소 공유 트래킹링크(native ShareUtils.ts와 동일). fallback: web.staircrusher.club/place/{placeId}
const PLACE_SHARE_SHORT_ID = 'place_share';

async function copyToClipboard(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    ToastUtils.show('링크가 복사되었습니다.');
  } catch {
    ToastUtils.show('링크 복사에 실패했습니다.');
  }
}

const ShareUtils = {
  // native와 동일한 트래킹링크(placeId만 실어 앱/web.staircrusher.club 열릴 때 라우팅).
  // 이전엔 현재 경로 기반 중첩 url(/place-list/:id/place/:id 등)을 복사했는데
  // webLinkingConfig에 없는 경로라 데스크톱에서 /home으로 튀었다.
  async sharePlace(place: Place) {
    await copyToClipboard(
      `https://link.staircrusher.club/${PLACE_SHARE_SHORT_ID}?placeId=${place.id}`,
    );
  },
  // 네이티브와 동일 시그니처. id 있으면 트래킹링크, 없으면 contentUrl을 클립보드에 복사.
  async shareSccContent(
    sccContentId: string | null,
    contentUrl: string,
    _title?: string,
  ) {
    if (sccContentId) {
      await copyToClipboard(
        `https://link.staircrusher.club/${SCC_CONTENT_SHARE_SHORT_ID}?sccContentId=${encodeURIComponent(sccContentId)}`,
      );
      return;
    }
    await copyToClipboard(contentUrl);
  },
};

export default ShareUtils;
