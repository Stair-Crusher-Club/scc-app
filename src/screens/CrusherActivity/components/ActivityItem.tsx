import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {EpochMillisTimestamp} from '@/generated-sources/openapi';
import {Text, View} from 'react-native';
import {formatDateKorean} from '../utils/date';

interface ActivityItemProps {
  activityDoneAt?: EpochMillisTimestamp;
  title: string;
}

export default function ActivityItem({
  activityDoneAt,
  title,
}: ActivityItemProps) {
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
              width: 10,
              height: 10,
              borderRadius: 5,
              paddingVertical: 2,
              backgroundColor: color.gray50,
              borderWidth: 2,
              borderColor: color.gray20,
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
            {formatDateKorean(activityDoneAt?.value)}
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontFamily: font.pretendardMedium,
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
