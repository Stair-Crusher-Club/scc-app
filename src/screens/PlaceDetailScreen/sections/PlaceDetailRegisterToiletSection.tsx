import {Text, TouchableOpacity, View} from 'react-native';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Place} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';

interface Props {
  place: Place;
}

export default function PlaceDetailRegisterToiletSection({place}: Props) {
  const navigation = useNavigation();
  return (
    <View
      style={{
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: color.white,
      }}>
      <Text
        style={{
          fontSize: 18,
          lineHeight: 26,
          color: color.black,
          fontFamily: font.pretendardBold,
          marginTop: 4,
        }}>
        장애인 화장실 정보
      </Text>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('ReviewForm/Toilet', {
            placeId: place.id,
          });
        }}
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          borderRadius: 12,
          backgroundColor: color.brand5,
          height: 48,
          marginTop: 16,
        }}>
        <PlusIcon width={12} height={12} color={color.brandColor} />
        <Text
          style={{
            color: color.brand50,
            fontSize: 16,
            fontFamily: font.pretendardMedium,
          }}>
          화장실 정보를 남겨주세요
        </Text>
      </TouchableOpacity>
    </View>
  );
}
