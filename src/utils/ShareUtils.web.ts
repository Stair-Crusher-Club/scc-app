import type {Place} from '@/generated-sources/openapi';
import ToastUtils from '@/utils/ToastUtils';

const SCC_CONTENT_SHARE_SHORT_ID = 'scc-content';

async function copyToClipboard(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    ToastUtils.show('링크가 복사되었습니다.');
  } catch {
    ToastUtils.show('링크 복사에 실패했습니다.');
  }
}

function buildPlaceShareUrl(placeId: string): string {
  const origin = window.location.origin;
  const path = window.location.pathname;

  // /place-list/:placeListId 경로에서 공유 시
  const placeListMatch = path.match(/^\/place-list\/([^/]+)/);
  if (placeListMatch) {
    return `${origin}/place-list/${placeListMatch[1]}/place/${encodeURIComponent(placeId)}`;
  }

  // /search/:query 경로에서 공유 시
  const searchMatch = path.match(/^\/search\/([^/]+)/);
  if (searchMatch) {
    return `${origin}/search/${searchMatch[1]}/place/${encodeURIComponent(placeId)}`;
  }

  // 기타: 현재 URL
  return window.location.href;
}

const ShareUtils = {
  async sharePlace(place: Place) {
    await copyToClipboard(buildPlaceShareUrl(place.id));
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
