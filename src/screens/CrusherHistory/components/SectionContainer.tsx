import {font} from '@/constant/font';
import {PropsWithChildren} from 'react';
import {Text, View} from 'react-native';

interface SectionLayoutProps extends PropsWithChildren {
  title: string;
}

export default function SectionContainer({
  title,
  children,
}: SectionLayoutProps) {
  return (
    <View style={{gap: 12}}>
      <Text
        style={{
          fontSize: 18,
          fontFamily: font.pretendardBold,
          lineHeight: 26,
        }}>
        {title}
      </Text>
      {children}
    </View>
  );
}
