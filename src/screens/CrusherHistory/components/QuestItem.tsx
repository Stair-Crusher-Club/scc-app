import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Image, Text, View} from 'react-native';

interface QuestItemProps {
  title: string;
  date?: string;
}

export default function QuestItem({title, date}: QuestItemProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        gap: 14,
      }}>
      <Image
        source={require('@/assets/img/img_crusher_history_badge.png')}
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
