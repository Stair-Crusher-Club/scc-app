import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {Image, View} from 'react-native';

import Options from '@/components/form/Options';
import Photos from '@/components/form/Photos';
import {StairHeightLevel, StairInfo} from '@/generated-sources/openapi';

import * as S from './ElevatorSection.style';
import {Guide} from './EnteranceSection';

const MAX_NUMBER_OF_TAKEN_PHOTOS = 3;

export default function ElevatorSection() {
  const form = useFormContext();
  const hasElevator = form.watch('hasElevator');

  return (
    <S.ElevatorSection>
      <S.Header>
        <S.SectionTitle>엘리베이터 정보</S.SectionTitle>
      </S.Header>
      <S.SubSection>
        <S.Label>엘리베이터가 있나요?</S.Label>
        <Controller
          name="hasElevator"
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
      </S.SubSection>
      {hasElevator && (
        <S.SubSection>
          <S.Label>
            엘리베이터 사진을 찍어 주세요{' '}
            <S.LabelExtra>(최대 {MAX_NUMBER_OF_TAKEN_PHOTOS}장)</S.LabelExtra>
          </S.Label>
          <Controller
            name="elevatorPhotos"
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
      )}
      {hasElevator && (
        <S.SubSection>
          <S.Label>엘리베이터까지 가는 길에 계단이 있나요?</S.Label>
          <Controller
            name="elevatorHasStairs"
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
          {hasElevator && form.watch('elevatorHasStairs') && (
            <Controller
              name="elevatorStairInfo"
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
      )}
      {hasElevator &&
        form.watch('elevatorHasStairs') &&
        form.watch('elevatorStairInfo') === StairInfo.One && (
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
                name="elevatorStairHeightLevel"
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
    </S.ElevatorSection>
  );
}
