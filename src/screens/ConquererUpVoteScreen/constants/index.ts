import {UpvoteTargetTypeDto} from '@/generated-sources/openapi';

export const tabItems: {
  value: UpvoteTargetTypeDto;
  label: string;
}[] = [
  {
    value: 'PLACE_ACCESSIBILITY',
    label: '장소',
  },
  {
    value: 'BUILDING_ACCESSIBILITY',
    label: '건물',
  },
];
