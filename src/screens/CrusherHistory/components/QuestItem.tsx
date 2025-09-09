import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Image, ImageSourcePropType, Text, View} from 'react-native';

interface QuestItemProps {
  source: ImageSourcePropType;
  title: string;
  date?: string;
}

export default function QuestItem({source, title, date}: QuestItemProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        gap: 14,
      }}>
      <Image
        source={source}
        style={{
          width: 84,
          height: 84,
        }}
      />
      <View
        style={{
          gap: 4,
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: font.pretendardMedium,
            lineHeight: 20,
          }}>
          {title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontFamily: font.pretendardRegular,
            lineHeight: 16,
            color: color.gray50,
          }}>
          {date}
        </Text>
      </View>
    </View>
  );
}

function QuestItemGap() {
  return <View style={{height: 16}} />;
}

QuestItem.Gap = QuestItemGap;
