import {Controller, useFormContext} from 'react-hook-form';
import {Text, View} from 'react-native';

import PressableChip from '@/components/PressableChip';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  MOBILITY_TOOL_LABELS,
  MOBILITY_TOOL_OPTIONS,
  UserMobilityToolMapDto,
} from '@/constant/review';

import Question from '../components/Question';
import * as S from './common.style';

export default function UserTypeSection({
  placeType = '장소',
  nickname,
}: {
  placeType?: string;
  nickname?: string;
}) {
  const {watch} = useFormContext<{
    mobilityTool: UserMobilityToolMapDto;
  }>();
  const mobilityTool = watch('mobilityTool');
  const isVisibleLabel = mobilityTool !== 'NONE';

  return (
    <S.Container>
      <S.Title>사용한 이동보조기기 유형</S.Title>

      <View style={{gap: 12}}>
        <Question required>
          {placeType} 방문시 사용한 것을 선택해주세요.
        </Question>
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
          backgroundColor: color.gray10,
          borderRadius: 4,
          alignItems: 'center',
          gap: 8,
        }}>
        <Text
          style={{
            color: color.gray60,
            fontSize: 13,
          }}>
          사용자 유형은 리뷰에서 이렇게 보여요!
        </Text>
        <View
          style={{
            flexDirection: 'row',
            gap: 4,
          }}>
          <Text
            style={{
              fontSize: 13,
              lineHeight: 18,
              fontFamily: font.pretendardMedium,
            }}>
            {nickname}
          </Text>
          {isVisibleLabel && (
            <Text
              style={{
                paddingVertical: 2,
                paddingHorizontal: 4,
                fontSize: 11,
                lineHeight: 14,
                fontFamily: font.pretendardMedium,
                color: color.gray50,
                backgroundColor: color.gray20,
                borderRadius: 3,
              }}>
              {MOBILITY_TOOL_LABELS[mobilityTool]}
            </Text>
          )}
        </View>
      </View>
    </S.Container>
  );
}
