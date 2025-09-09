import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Text, View} from 'react-native';

interface ActivityItemProps {
  date: string;
  title: string;
}

export default function ActivityItem({date, title}: ActivityItemProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
      <View style={{gap: 12, flexDirection: 'row', alignItems: 'flex-start'}}>
        <View
          style={{
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              paddingVertical: 2,
              backgroundColor: color.gray30,
            }}
          />
        </View>
        <View style={{gap: 6}}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: font.pretendardRegular,
              lineHeight: 20,
              color: color.gray50,
            }}>
            {date}
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontFamily: font.pretendardBold,
              lineHeight: 26,
              color: color.gray90,
            }}>
            {title}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ActivityItemGap() {
  return <View style={{height: 32}} />;
}

ActivityItem.Gap = ActivityItemGap;
