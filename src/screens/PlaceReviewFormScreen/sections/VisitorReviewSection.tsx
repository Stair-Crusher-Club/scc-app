import {Controller} from 'react-hook-form';
import {Text, View} from 'react-native';

import PressableChip from '@/components/PressableChip';
import Photos from '@/components/form/Photos';
import TextInput from '@/components/form/TextArea';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  RECOMMEND_MOBILITY_TOOL_OPTIONS,
  SPACIOUS_OPTIONS,
} from '@/constant/review';

import * as S from './common.style';

const MAX_NUMBER_OF_TAKEN_PHOTOS = 3;

export default function VisitorReviewSection() {
  return (
    <S.Container>
      <S.Title>방문 리뷰</S.Title>

      <View style={{gap: 36}}>
        <View style={{gap: 12}}>
          <S.Question>
            <Text style={{color: color.red}}>* </Text>누구에게 추천하시나요?
            <Text style={{color: '#A1A1AF'}}> (중복선택)</Text>
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
              name="recommendedMobilityTypes"
              rules={{required: true, validate: value => value.size > 0}}
              render={({field}) => (
                <>
                  {RECOMMEND_MOBILITY_TOOL_OPTIONS.map(
                    ({label, value}, idx) => (
                      <PressableChip
                        key={label + idx}
                        label={label}
                        active={field.value?.has(value)}
                        onPress={() => {
                          const newSet = new Set(field.value);
                          if (newSet.has(value)) {
                            newSet.delete(value);
                          } else {
                            newSet.add(value);
                          }
                          field.onChange(newSet);
                        }}
                      />
                    ),
                  )}
                </>
              )}
            />
          </View>
        </View>

        <View style={{gap: 12}}>
          <S.Question>
            <Text style={{color: color.red}}>* </Text>내부 공간 휠체어, 유아차로
            이용하기 여유롭나요?
          </S.Question>
          {/* Chip */}
          <View style={{alignItems: 'flex-start', gap: 8}}>
            <Controller
              name="spaciousType"
              rules={{required: true}}
              render={({field}) => (
                <>
                  {SPACIOUS_OPTIONS.map(({label, value}) => (
                    <PressableChip
                      key={value}
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

        <View style={{gap: 12}}>
          <S.Question>장소 이용 경험을 알려주세요.</S.Question>
          <Controller
            name="indoorPhotos"
            rules={{required: false}}
            render={({field}) => (
              <Photos
                value={field.value ?? []}
                onChange={field.onChange}
                target="place"
                maxPhotos={MAX_NUMBER_OF_TAKEN_PHOTOS}
              />
            )}
          />

          <View style={{gap: 8}}>
            <Controller
              name="comment"
              render={({field}) => (
                <>
                  <TextInput
                    multiline
                    style={{
                      color: color.black,
                      fontSize: 16,
                      fontFamily: font.pretendardRegular,
                      paddingVertical: 0,
                      textAlignVertical: 'top',
                      minHeight: 90,
                    }}
                    value={field.value}
                    maxLength={300}
                    placeholder={
                      '장소의 전체적인 접근성, 방문 경험을 나눠주세요.'
                    }
                    placeholderTextColor={color.gray50}
                    onChangeText={field.onChange}
                  />
                  <Text
                    style={{
                      alignSelf: 'flex-end',
                      color: '#7A7A88',
                    }}>
                    {field.value?.length ?? 0}/300
                  </Text>
                </>
              )}
            />
          </View>
        </View>
      </View>
    </S.Container>
  );
}
