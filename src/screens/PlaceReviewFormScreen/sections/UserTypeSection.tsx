import {Controller, useFormContext} from 'react-hook-form';
import {Text, View} from 'react-native';

import PressableChip from '@/components/PressableChip';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  MOBILITY_TOOL_LABELS,
  MOBILITY_TOOL_OPTIONS,
} from '@/constant/mobilityTool';
import {UserMobilityToolDto} from '@/generated-sources/openapi';
import useMe from '@/hooks/useMe';

import * as S from './common.style';

export default function UserTypeSection() {
  const {userInfo} = useMe();
  const {watch} = useFormContext<{
    mobilityTool: UserMobilityToolDto;
  }>();
  const mobilityTool = watch('mobilityTool');

  return (
    <S.Container>
      <S.Title>사용자 유형</S.Title>

      <View style={{gap: 12}}>
        <S.Question>
          <Text style={{color: color.red}}>* </Text>매장이용시 사용한
          이동보조기기를 선택해주세요.
        </S.Question>
        {/* Chip */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            gap: 8,
          }}>
          <Controller
            name="mobilityTool"
            rules={{required: true}}
            render={({field}) => (
              <>
                {MOBILITY_TOOL_OPTIONS.filter(
                  ({value}) => value !== 'CLUCH',
                ).map(({label, value}, idx) => (
                  <PressableChip
                    key={label + idx}
                    label={label}
                    active={field.value === value}
                    onPress={() => field.onChange(value)}
                  />
                ))}
              </>
            )}
          />
        </View>
      </View>

      <View
        style={{
          padding: 12,
          backgroundColor: '#F7F7F9',
          borderRadius: 4,
          alignItems: 'center',
          gap: 8,
        }}>
        <Text>사용자 유형은 리뷰에서 이렇게 보여요!</Text>
        <View
          style={{
            flexDirection: 'row',
            gap: 4,
          }}>
          <Text
            style={{
              fontSize: 13,
              lineHeight: 18,
              fontFamily: font.pretendardBold,
            }}>
            {userInfo?.nickname}
          </Text>
          <Text
            style={{
              paddingVertical: 2,
              paddingHorizontal: 4,
              fontSize: 11,
              lineHeight: 14,
              fontFamily: font.pretendardMedium,
              color: color.brand,
              backgroundColor: color.brand5,
            }}>
            {MOBILITY_TOOL_LABELS[mobilityTool]}
          </Text>
        </View>
      </View>
    </S.Container>
  );
}
