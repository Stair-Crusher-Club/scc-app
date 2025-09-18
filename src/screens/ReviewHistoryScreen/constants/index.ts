import {UpvoteTargetTypeDto} from '@/generated-sources/openapi';

export const tabItems: {
  value: UpvoteTargetTypeDto;
  label: string;
}[] = [
  {
    value: 'PLACE_REVIEW',
    label: '내부 이용 정보',
  },
  {
    value: 'TOILET_REVIEW',
    label: '장애인 화장실 정보',
  },
];
