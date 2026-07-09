import {Share} from 'react-native';

import {Place} from '@/generated-sources/openapi';

const SCC_CONTENT_SHARE_SHORT_ID = 'scc-content';

const ShareUtils = {
  async sharePlace(place: Place) {
    const url = `https://link.staircrusher.club/c8yi3t?placeId=${place.id}`;
    return Share.share({
      message: `[${place.name}]의 접근성 정보를 계단뿌셔클럽 앱에서 확인해보세요!\n${url}`,
    });
  },
  // SccContent(웹뷰로 보는 컨텐츠) 공유. sccContentId 가 있으면 트래킹링크(id만 실어
  // 앱/web.staircrusher.club 이 열렸을 때 원본 url로 라우팅)를, 없으면 contentUrl을 그대로 공유.
  async shareSccContent(
    sccContentId: string | null,
    contentUrl: string,
    title?: string,
  ) {
    if (sccContentId) {
      const url = `https://link.staircrusher.club/${SCC_CONTENT_SHARE_SHORT_ID}?sccContentId=${encodeURIComponent(sccContentId)}`;
      return Share.share({
        message: title
          ? `[${title}]를 계단뿌셔클럽에서 확인해보세요!\n${url}`
          : url,
      });
    }
    return Share.share({
      message: title
        ? `[${title}]를 계단뿌셔클럽에서 확인해보세요!\n${contentUrl}`
        : contentUrl,
    });
  },
};

export default ShareUtils;
