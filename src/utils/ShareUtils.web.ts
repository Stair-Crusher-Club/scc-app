import {Place} from '@/generated-sources/openapi';
import ToastUtils from '@/utils/ToastUtils';

const ShareUtils = {
  async sharePlace(place: Place) {
    const url = `https://link.staircrusher.club/c8yi3t?placeId=${place.id}`;
    try {
      await navigator.clipboard.writeText(url);
      ToastUtils.show('링크가 복사되었습니다.');
    } catch {
      ToastUtils.show('링크 복사에 실패했습니다.');
    }
  },
};

export default ShareUtils;
