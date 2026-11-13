import React from 'react';
import {Text, View} from 'react-native';

import {SccTouchableHighlight} from '@/components/SccTouchableHighlight';
import {color} from '@/constant/color';
import useNavigation from '@/navigation/useNavigation';

// 스토어 정책상 앱 안에서 열람 가능해야 한다 (Google Play 사용자 데이터 정책). 공개 노션 페이지.
export const PRIVACY_POLICY_URL =
  'https://agnica.notion.site/17ac9499b06080d9bea9d368564cf271';
export const TERMS_OF_SERVICE_URL =
  'https://agnica.notion.site/07acba336959451fbdddcbd26e8d49b0';

interface Props {
  title: string;
  url: string;
  elementName: string;
}

export default function PolicyLinkRow({title, url, elementName}: Props) {
  const navigation = useNavigation();

  return (
    <SccTouchableHighlight
      elementName={elementName}
      activeOpacity={0.9}
      underlayColor={color.gray10}
      onPress={() =>
        navigation.navigate('Webview', {
          fixedTitle: title,
          url,
          headerVariant: 'navigation',
        })
      }>
      <View className="px-5 py-5">
        <Text className="font-pretendard-medium text-[16px] leading-[26px] text-black">
          {title}
        </Text>
      </View>
    </SccTouchableHighlight>
  );
}
