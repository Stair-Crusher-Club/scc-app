import {Text} from 'react-native';

import {SccPressable} from '@/components/SccPressable';
import useNavigation from '@/navigation/useNavigation';

type GuideType = 'stairs' | 'slope';

const GUIDE_CONFIG = {
  stairs: {
    title: '계단 기준 알아보기',
    url: 'https://agnica.notion.site/8312cc653a8f4b9aa8bc920bbd668218',
  },
  slope: {
    title: '경사로 기준 알아보기',
    url: 'https://agnica.notion.site/6f64035a062f41e28745faa4e7bd0770',
  },
} as const;

interface GuideLinkProps {
  type: GuideType;
  elementName: string;
}

export default function GuideLink({type, elementName}: GuideLinkProps) {
  const navigation = useNavigation();
  const config = GUIDE_CONFIG[type];

  return (
    <SccPressable
      elementName={elementName}
      onPress={() =>
        navigation.navigate('Webview', {
          fixedTitle: config.title,
          url: config.url,
        })
      }>
      <Text className="font-pretendard-medium text-blue-50 text-[14px] leading-[20px]">
        {config.title} {'>'}
      </Text>
    </SccPressable>
  );
}
