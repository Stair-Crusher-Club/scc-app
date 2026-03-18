import React, {PropsWithChildren} from 'react';
import {Text, View} from 'react-native';

interface SectionLayoutProps extends PropsWithChildren {
  title: string;
  rightComponent?: React.ReactNode;
}

export default function SectionContainer({
  title,
  rightComponent,
  children,
}: SectionLayoutProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <Text className="font-pretendard-bold text-[18px] leading-[26px] text-black">
          {title}
        </Text>
        {rightComponent}
      </View>
      {children}
    </View>
  );
}
