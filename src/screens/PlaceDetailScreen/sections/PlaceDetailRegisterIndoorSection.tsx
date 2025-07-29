import {Text, TouchableOpacity, View} from 'react-native';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import StyledText from '@/components/StyledText';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {LogClick} from '@/logging/LogClick';

interface Props {
  title: string;
  buttonText: string;
  onPress?: () => void;
  logKey: string;
}

export default function PlaceDetailRegisterButtonSection({
  title,
  buttonText,
  onPress,
  logKey,
}: Props) {
  return (
    <View
      style={{
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: color.white,
      }}>
      <StyledText
        text={title}
        style={{
          fontSize: 16,
          lineHeight: 26,
          color: color.black,
          fontFamily: font.pretendardBold,
        }}
        boldStyle={{color: color.blue50}}
      />
      <LogClick elementName={logKey}>
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
            marginTop: 20,
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
      </LogClick>
    </View>
  );
}
