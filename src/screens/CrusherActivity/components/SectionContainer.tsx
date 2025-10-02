import {font} from '@/constant/font';
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
    <View style={{gap: 12}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: font.pretendardBold,
            lineHeight: 26,
          }}>
          {title}
        </Text>
        {rightComponent}
      </View>
      {children}
    </View>
  );
}
