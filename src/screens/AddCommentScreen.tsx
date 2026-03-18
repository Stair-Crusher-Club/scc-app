import {useQueryClient} from '@tanstack/react-query';
import React, {useState} from 'react';
import {Platform, ScrollView, Text, TextInput, View} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import useAppComponents from '@/hooks/useAppComponents';
import usePost from '@/hooks/usePost';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {AccessibilityTypes} from '@/models/AccessibilityTypes';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {cn} from '@/utils/cn';
import ToastUtils from '@/utils/ToastUtils';

export interface AddCommentScreenParams {
  type: AccessibilityTypes;
  placeId: string;
  buildingId?: string;
}

const AddCommentScreen = ({navigation, route}: ScreenProps<'AddComment'>) => {
  const {api} = useAppComponents();
  const {type, placeId, buildingId} = route.params;
  const id = buildingId ?? placeId;
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();
  const registerComment = usePost<{
    type: 'place' | 'building';
    comment: string;
    id: string;
  }>(['AddComment', type, id], async params => {
    if (params.type === 'place') {
      await api.registerPlaceAccessibilityCommentPost({
        comment: params.comment,
        placeId: id,
      });
    } else {
      await api.registerBuildingAccessibilityCommentPost({
        comment: params.comment,
        buildingId: id,
      });
    }

    // PlaceDetailScreen 전체 데이터 갱신
    queryClient.invalidateQueries({
      queryKey: ['PlaceDetailV2', placeId],
    });

    // PlaceDetailScreen 접근성 정보 갱신 (코멘트 즉시 표시)
    queryClient.invalidateQueries({
      queryKey: ['PlaceDetailV2', placeId, 'Accessibility'],
    });

    ToastUtils.show('의견이 등록되었습니다.');
    navigation.goBack();
  });

  let logParams = {};
  if (type === 'place') {
    logParams = {place_id: placeId};
  } else {
    logParams = {building_id: buildingId};
  }

  return (
    <LogParamsProvider params={logParams}>
      <ScreenLayout isHeaderVisible={true} safeAreaEdges={['bottom']}>
        <ScrollView
          className="bg-white"
          contentContainerClassName="px-[20px] pb-[20px]">
          <View>
            <Text className="mt-[18px] mb-[20px] font-pretendard-bold text-[24px] leading-[32px] text-black">
              의견추가
            </Text>
            <Text className="font-pretendard-regular text-[16px] leading-[24px] text-black">
              더 도움이 될 정보가 있다면 남겨주세요!
              <Text className="font-pretendard-regular text-[16px] leading-[24px] text-gray-70">
                (선택)
              </Text>
            </Text>
            <View className="mt-[20px] rounded-[20px] border-[1px] border-brand-50 px-[25px] py-[20px]">
              <TextInput
                multiline
                className={cn(
                  'p-0 font-pretendard-regular text-[16px] leading-[24px] text-black',
                  Platform.OS === 'android' && 'min-h-[50px]',
                )}
                value={comment}
                maxLength={100}
                placeholder={
                  '예시) 후문에는 계단이 없어 편하게 갈 수 있습니다 (최대 100글자)'
                }
                placeholderTextColor={color.gray50}
                onChangeText={text => setComment(text)}
              />
            </View>
            <Text className="mt-[10px] mr-[4px] text-right font-pretendard-regular text-[14px] leading-[20px] text-gray-70">
              {comment.length} / 100
            </Text>
          </View>
        </ScrollView>
        <SccButton
          style={{marginHorizontal: 20, marginBottom: 20}}
          text="등록하기"
          onPress={() => {
            registerComment.mutate({type, comment, id});
          }}
          elementName="add_comment_register"
        />
      </ScreenLayout>
    </LogParamsProvider>
  );
};

export default AddCommentScreen;
