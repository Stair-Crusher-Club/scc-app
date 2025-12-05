import {PropsWithChildren} from 'react';
import {View} from 'react-native';

// Style components shared across PlaceFormV2 and BuildingFormV2
export const HeaderBorder = () => <View className="border-b border-blue-5" />;

export const SectionSeparator = () => <View className="bg-gray-10 h-[6px]" />;

export const SubmitButtonWrapper = ({children}: PropsWithChildren) => (
  <View className="flex-row bg-white py-[12px] px-[20px] gap-[8px] border-t border-gray-15">
    {children}
  </View>
);
