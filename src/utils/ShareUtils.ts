import {Share} from 'react-native';

import {Place} from '@/generated-sources/openapi';

const ShareUtils = {
  async sharePlace(place: Place) {
    const url = `https://link.staircrusher.club/c8yi3t?placeId=${place.id}`;
    return Share.share({
      message: `[${place.name}]의 접근성 정보를 계단뿌셔클럽 앱에서 확인해보세요!\n${url}`,
    });
  },
  async shareBbucleRoad(bbucleRoadId: string, title?: string) {
    const url = `https://link.staircrusher.club/enz1zxm?bbucleRoadId=${bbucleRoadId}`;
    return Share.share({
      message: `[${title || '뿌클로드'}]를 계단뿌셔클럽 앱에서 확인해보세요!\n${url}`,
    });
  },
};

export default ShareUtils;
