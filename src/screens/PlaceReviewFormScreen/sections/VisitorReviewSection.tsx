import {Controller} from 'react-hook-form';
import {Text, View} from 'react-native';

import PressableChip from '@/components/PressableChip';
import Photos from '@/components/form/Photos';
import TextInput from '@/components/form/TextArea';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

import * as S from './common.style';

const MAX_NUMBER_OF_TAKEN_PHOTOS = 3;

const mobilityTools = [
  '수동휠체어',
  '전동휠체어',
  '고령자',
  '유아차 동반',
  '모름',
  '추천안함',
];

const useful = [
  '매우 넓고, 이용하기 적합해요 🥰',
  '대부분의 구역을 이용하기에 적합해요😀',
  '일부 구역만 이용하기에 적합해요 🙂',
  '매우 좁아서 내부 이동이 불가능해요 🥲',
];

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
              name="mobilityTool"
              rules={{required: true, validate: value => value.size > 0}}
              render={({field}) => (
                <>
                  {mobilityTools.map((label, idx) => (
                    <PressableChip
                      key={label + idx}
                      label={label}
                      active={field.value?.has(label)}
                      onPress={() => {
                        const newSet = new Set(field.value);
                        if (newSet.has(label)) {
                          newSet.delete(label);
                        } else {
                          newSet.add(label);
                        }
                        field.onChange(newSet);
                      }}
                    />
                  ))}
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
              name="useful"
              rules={{required: true}}
              render={({field}) => (
                <>
                  {useful.map((label, idx) => (
                    <PressableChip
                      key={label + idx}
                      label={label}
                      active={field.value === label}
                      onPress={() => field.onChange(label)}
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
              name="experience"
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
