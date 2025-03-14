import {SearchPlaceSortDto} from '@/generated-sources/openapi';

const Converters = {
  displayText: (dto: SearchPlaceSortDto) => {
    switch (dto) {
      case SearchPlaceSortDto.Accuracy:
        return '정확도 순';
      case SearchPlaceSortDto.Distance:
        return '가까운 순';
      case SearchPlaceSortDto.AccessibilityScore:
        return '접근레벨  낮은 순';
    }
  },
};

export default Converters;
