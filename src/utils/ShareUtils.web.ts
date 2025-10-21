import {Place} from '@/generated-sources/openapi';
import ToastUtils from '@/utils/ToastUtils';

const ShareUtils = {
  async sharePlace(place: Place) {
    const url = `https://link.staircrusher.club/c8yi3t?placeId=${place.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name,
          url,
          text: `[${place.name}]의 접근성 정보를 계단뿌셔클럽 앱에서 확인해보세요!`,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          ToastUtils.show('공유에 실패했습니다.');
        }
      }
    } else {
      // Fallback for web browsers that don't support navigator.share
      await navigator.clipboard.writeText(url);
      ToastUtils.show('링크가 클립보드에 복사되었습니다.');
    }
  },
};

export default ShareUtils;
