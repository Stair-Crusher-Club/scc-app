import {FlashList} from '@shopify/flash-list';
import React, {useMemo} from 'react';
import {Text, View} from 'react-native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {cn} from '@/utils/cn';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

interface YearItem {
  year: number;
  isSelected: boolean;
}

const CURRENT_YEAR = new Date().getFullYear();
const START_YEAR = 1900;

export default function BirthYearSelector({value, onChange, onClose}: Props) {
  const years = useMemo(() => {
    return Array.from(
      {length: CURRENT_YEAR - START_YEAR + 1},
      (_, i): YearItem => ({
        year: CURRENT_YEAR - i,
        isSelected: value === (CURRENT_YEAR - i).toString(),
      }),
    );
  }, [value]);

  const renderItem = ({item}: {item: YearItem}) => (
    <SccTouchableOpacity
      elementName="birth_year_item"
      onPress={() => {
        onChange(item.year.toString());
        onClose();
      }}
      className={cn('p-[16px]', item.isSelected ? 'bg-gray-10' : 'bg-white')}>
      <Text
        className={cn(
          'font-pretendard-medium text-[16px] text-center',
          item.isSelected ? 'text-blue-50' : 'text-gray-100',
        )}>
        {item.year}년
      </Text>
    </SccTouchableOpacity>
  );

  return (
    <View className="bg-white rounded-t-[16px] h-[400px]">
      <View className="flex-row justify-between items-center p-[16px] border-b-[1px] border-gray-20">
        <SccTouchableOpacity
          elementName="birth_year_cancel_button"
          onPress={onClose}
          className="p-[8px]">
          <Text className="font-pretendard-medium text-[16px] text-blue-50">
            취소
          </Text>
        </SccTouchableOpacity>
        <Text className="font-pretendard-bold text-[16px] text-gray-100">
          출생연도
        </Text>
        <SccTouchableOpacity
          elementName="birth_year_done_button"
          onPress={onClose}
          className="p-[8px]">
          <Text className="font-pretendard-medium text-[16px] text-blue-50">
            완료
          </Text>
        </SccTouchableOpacity>
      </View>
      <View className="flex-1">
        <FlashList
          data={years}
          renderItem={renderItem}
          estimatedItemSize={50}
          keyExtractor={item => item.year.toString()}
        />
      </View>
    </View>
  );
}
