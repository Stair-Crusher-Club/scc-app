import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {Image, View} from 'react-native';

import Options from '@/components/form/Options';
import Photos from '@/components/form/Photos';
import {SccPressable} from '@/components/SccPressable';
import {MAX_NUMBER_OF_TAKEN_PHOTOS} from '@/constant/constant';
import {makeDoorTypeOptions} from '@/constant/options';
import {StairHeightLevel, StairInfo} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';

import * as S from './EnteranceSection.style';

export default function EnteranceSection() {
  const form = useFormContext();

  return (
    <S.EnteranceSection>
      <S.Header>
        <S.SectionTitle>건물 입구 정보</S.SectionTitle>
      </S.Header>
      <S.SubSection>
        <S.Label>
          입구 사진을 찍어주세요{' '}
          <S.LabelExtra>(최대 {MAX_NUMBER_OF_TAKEN_PHOTOS}장)</S.LabelExtra>
        </S.Label>
        <Controller
          name="enterancePhotos"
          rules={{required: true}}
          render={({field}) => (
            <Photos
              value={field.value ?? []}
              onChange={field.onChange}
              target="building"
              maxPhotos={MAX_NUMBER_OF_TAKEN_PHOTOS}
            />
          )}
        />
      </S.SubSection>
      <S.SubSection key="stairs">
        <S.Label>입구에 계단이 있나요?</S.Label>
        <Controller
          name="hasStairs"
          rules={{validate: v => typeof v === 'boolean'}}
          render={({field}) => (
            <Options
              value={field.value}
              options={[
                {label: '있어요', value: true},
                {label: '없어요', value: false},
              ]}
              onSelect={field.onChange}
            />
          )}
        />
        {form.watch('hasStairs') && (
          <Controller
            name="stairInfo"
            rules={{required: true}}
            render={({field}) => (
              <Options
                value={field.value}
                columns={3}
                options={[
                  {label: '1칸', value: StairInfo.One},
                  {label: '2-5칸', value: StairInfo.TwoToFive},
                  {label: '6칸 이상', value: StairInfo.OverSix},
                ]}
                onSelect={field.onChange}
              />
            )}
          />
        )}
        <Guide
          key="stair-guide"
          text="계단 기준 알아보기"
          url="https://agnica.notion.site/8312cc653a8f4b9aa8bc920bbd668218"
        />
      </S.SubSection>
      {form.watch('hasStairs') && form.watch('stairInfo') === StairInfo.One && (
        <S.SubSection key="stair-height">
          <S.Label>계단 1칸의 높이를 알려주세요.</S.Label>
          <S.MeasureGuide>
            <Image
              source={require('@/assets/img/stair_thumb.jpg')}
              style={{width: '100%', height: '100%'}}
            />
          </S.MeasureGuide>
          <View style={{gap: 16}}>
            <Controller
              name="entranceStairHeightLevel"
              rules={{required: true}}
              render={({field}) => (
                <Options
                  value={field.value}
                  options={[
                    {label: '엄지 한마디', value: StairHeightLevel.HalfThumb},
                    {label: '엄지 손가락', value: StairHeightLevel.Thumb},
                    {
                      label: '엄지 손가락 이상',
                      value: StairHeightLevel.OverThumb,
                    },
                  ]}
                  onSelect={field.onChange}
                />
              )}
            />
          </View>
        </S.SubSection>
      )}
      <S.SubSection key="slopes">
        <S.Label>입구에 경사로가 있나요?</S.Label>
        <Controller
          name="hasSlope"
          rules={{validate: v => typeof v === 'boolean'}}
          render={({field}) => (
            <Options
              value={field.value}
              options={[
                {label: '있어요', value: true},
                {label: '없어요', value: false},
              ]}
              onSelect={field.onChange}
            />
          )}
        />
        <Guide
          key="slope-guide"
          text="경사로 기준 알아보기"
          url="https://agnica.notion.site/6f64035a062f41e28745faa4e7bd0770"
        />
      </S.SubSection>
      <S.SubSection>
        <S.Label>
          출입문 유형을 알려주세요.
          <S.LabelExtra>(중복선택)</S.LabelExtra>
        </S.Label>
        <Controller
          name="doorTypes"
          rules={{required: true}}
          render={({field}) => (
            <Options.Multiple
              values={field.value}
              options={makeDoorTypeOptions(form.watch('doorTypes') ?? [])}
              onSelect={field.onChange}
            />
          )}
        />
      </S.SubSection>
    </S.EnteranceSection>
  );
}

interface GuideProps {
  text: string;
  url: string;
}
export function Guide({text, url}: GuideProps) {
  const navigation = useNavigation();
  function handleClick() {
    navigation.navigate('Webview', {fixedTitle: text, url});
  }
  return (
    <S.Guide>
      <SccPressable
        elementName="building_entrance_section_guide"
        logParams={{guide_text: text, guide_url: url}}
        onPress={handleClick}>
        <S.GuideText>
          {text} {'>'}
        </S.GuideText>
      </SccPressable>
    </S.Guide>
  );
}
