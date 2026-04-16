import type {Place} from '@/generated-sources/openapi';
import ToastUtils from '@/utils/ToastUtils';

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
  async shareBbucleRoad(_bbucleRoadId: string, _title?: string) {
    await copyToClipboard(window.location.href);
  },
};

export default ShareUtils;
