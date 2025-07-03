import {Text, TouchableOpacity, View} from 'react-native';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Place} from '@/generated-sources/openapi';

interface Props {
  place: Place;
}

export default function PlaceDetailRegisterIndoorSection({place}: Props) {
  const placeName = place.name;
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 32,
        paddingHorizontal: 20,
        backgroundColor: color.white,
      }}>
      <Text
        style={{
          fontSize: 14,
          lineHeight: 20,
          color: color.gray70,
        }}>
        {placeName} 에 방문하셨나요?
      </Text>
      <Text
        style={{
          fontSize: 18,
          lineHeight: 26,
          color: color.gray100,
          fontFamily: font.pretendardBold,
          marginTop: 5,
        }}>
        방문 후기를 남겨주세요
      </Text>
      <TouchableOpacity
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          borderRadius: 12,
          backgroundColor: color.brand5,
          paddingVertical: 13,
          marginTop: 16,
        }}>
        <PlusIcon width={12} height={12} color={color.brandColor} />
        <Text style={{color: color.brandColor, fontSize: 16}}>
          방문 후기를 남겨주세요
        </Text>
      </TouchableOpacity>
    </View>
  );
}
