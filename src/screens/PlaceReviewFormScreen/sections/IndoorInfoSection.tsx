import {Controller, useFormContext} from 'react-hook-form';
import {Text, View} from 'react-native';

import PressableChip from '@/components/PressableChip';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

import * as S from './common.style';

const seatingTypes = [
  '입식',
  '좌식(신발 벗고 앉는 구조)',
  '바테이블',
  '카운터석(낮음)',
  '카운터석(높음)',
  '고정좌석',
  '테라스석',
  '기타',
];

const orderMethods = [
  '카운터 방문주문',
  '키오스크 주문',
  '베리어프리 키오스크 주문',
  '테이블 오더 주문',
  '자리에서 직원에게 질문',
];

const accessibilityFeatures = [
  '휠체어 이용 가능한 좌석 수 3개 이상',
  '직원 도움 없이 이동 가능',
  '바닥에 턱/장애물 없음',
  '혼잡한 시간대 주의 필요',
  '아이 식기, 의자 있음',
  '반려동물 동반 가능',
  '비건메뉴 있음',
];

export default function IndoorInfoSection({
  onSave,
  onSaveAndToiletReview,
}: {
  onSave: () => void;
  onSaveAndToiletReview: () => void;
}) {
  const {formState} = useFormContext();

  return (
    <S.Container>
      <S.Title>내부 이용 정보</S.Title>

      <View style={{gap: 36}}>
        <View style={{gap: 12}}>
          <S.Question>
            <Text style={{color: color.red}}>* </Text>매장 이용 좌석 구성을
            알려주세요.
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
              name="seats"
              rules={{required: true, validate: value => value.size > 0}}
              render={({field}) => (
                <>
                  {seatingTypes.map((label, idx) => (
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
            <Text style={{color: color.red}}>* </Text>매장 주문 방법을
            알려주세요.
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
              name="order"
              rules={{required: true, validate: value => value.size > 0}}
              render={({field}) => (
                <>
                  {orderMethods.map((label, idx) => (
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
            공간 특이사항을 알려주세요.
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
              name="specialNotes"
              render={({field}) => (
                <>
                  {accessibilityFeatures.map((label, idx) => (
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

        <View style={{gap: 10, paddingTop: 10}}>
          <SccButton
            text="저장하기"
            isDisabled={!formState.isValid}
            style={{
              borderRadius: 10,
              backgroundColor: color.brand,
            }}
            fontSize={18}
            fontFamily={font.pretendardBold}
            onPress={onSave}
          />
          <SccButton
            text="저장하고 화장실도 등록하기"
            isDisabled={!formState.isValid}
            style={{
              borderRadius: 10,
              backgroundColor: color.gray10,
            }}
            fontSize={18}
            textColor="black"
            fontFamily={font.pretendardMedium}
            onPress={onSaveAndToiletReview}
          />
        </View>
      </View>
    </S.Container>
  );
}
