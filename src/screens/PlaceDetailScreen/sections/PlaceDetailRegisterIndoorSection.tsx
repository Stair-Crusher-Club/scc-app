import {Text, TouchableOpacity, View} from 'react-native';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface Props {
  subTitle?: string;
  title: string;
  buttonText: string;
  onPress?: () => void;
}

export default function PlaceDetailRegisterButtonSection({
  subTitle,
  title,
  buttonText,
  onPress,
}: Props) {
  return (
    <View
      style={{
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: color.white,
      }}>
      {subTitle && (
        <Text
          style={{
            fontSize: 14,
            lineHeight: 20,
            fontFamily: font.pretendardRegular,
            color: color.gray60,
          }}>
          {subTitle}
        </Text>
      )}
      <Text
        style={{
          fontSize: 18,
          lineHeight: 26,
          color: color.black,
          fontFamily: font.pretendardBold,
          marginTop: 4,
        }}>
        {title}
      </Text>
      <TouchableOpacity
        onPress={onPress}
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
          {buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
