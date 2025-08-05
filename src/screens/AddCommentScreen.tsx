import {useQueryClient} from '@tanstack/react-query';
import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import useAppComponents from '@/hooks/useAppComponents';
import usePost from '@/hooks/usePost';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {AccessibilityTypes} from '@/models/AccessibilityTypes';
import {ScreenProps} from '@/navigation/Navigation.screens';
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
    queryClient.invalidateQueries({
      queryKey: ['PlaceDetail', placeId],
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
      <ScreenLayout
        isHeaderVisible={true}
        safeAreaEdges={['bottom']}
        style={styles.container}>
        <ScrollView>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>의견추가</Text>
            <Text style={styles.description}>
              더 도움이 될 정보가 있다면 남겨주세요!
              <Text style={styles.optionalText}>(선택)</Text>
            </Text>
            <View style={styles.commentContainer}>
              <TextInput
                multiline
                style={styles.commentInput}
                value={comment}
                maxLength={100}
                placeholder={
                  '예시) 후문에는 계단이 없어 편하게 갈 수 있습니다 (최대 100글자)'
                }
                placeholderTextColor={color.gray50}
                onChangeText={text => setComment(text)}
              />
            </View>
            <Text style={styles.commentCharactersCount}>
              {comment.length} / 100
            </Text>
          </View>
        </ScrollView>
        <SccButton
          style={styles.registerButton}
          text="등록하기"
          onPress={() => {
            registerComment.mutate({type, comment, id});
          }}
        />
      </ScreenLayout>
    </LogParamsProvider>
  );
};

export default AddCommentScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.white,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 18,
    marginBottom: 20,
    color: color.black,
    fontFamily: font.pretendardBold,
    fontSize: 24,
  },
  description: {
    fontSize: 16,
    fontFamily: font.pretendardRegular,
    color: color.black,
  },
  optionalText: {
    fontSize: 16,
    fontFamily: font.pretendardRegular,
    color: color.gray70,
  },
  commentContainer: {
    borderColor: color.brandColor,
    borderWidth: 1,
    borderRadius: 20,
    marginTop: 20,
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  commentInput: {
    color: 'black',
    fontSize: 16,
    fontFamily: font.pretendardRegular,
    paddingVertical: 0,
    textAlignVertical: 'top',
  },
  commentCharactersCount: {
    marginTop: 10,
    marginRight: 4,
    textAlign: 'right',
    color: color.gray70,
  },
  registerButton: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
});
