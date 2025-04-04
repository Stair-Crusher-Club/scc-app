import {Place} from '@/generated-sources/openapi';
import ToastUtils from '@/utils/ToastUtils';

const ShareUtils = {
  async sharePlace(place: Place) {
    place;
    ToastUtils.show('준비 중입니다.');
    // TODO: universal link 이상 확인 후 복구하기
    // const url = `https://scc.airbridge.io/place/${place.id}`;
    // return Share.share({
    //   title: place.name,
    //   url,
    //   message: `"${place.name}" 의 접근성 정보를 계단뿌셔클럽 앱에서 확인해보세요\n${url}`,
    // });
  },
};

export default ShareUtils;
