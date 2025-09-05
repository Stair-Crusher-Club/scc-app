import React from 'react';
import {ScrollView, View} from 'react-native';
import styled from 'styled-components/native';

import GotoIcon from '@/assets/icon/ic_goto.svg';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {MOBILITY_TOOL_LABELS} from '@/constant/mobilityTool';
import {useMe} from '@/atoms/Auth';
import useNavigation from '@/navigation/useNavigation';

export default function ProfileEditorScreen() {
  const {userInfo} = useMe();
  const navigation = useNavigation();
  return (
    <ScreenLayout isHeaderVisible>
      <ScrollView style={{backgroundColor: color.white}}>
        <View style={{alignItems: 'stretch'}}>
          <FieldArea
            elementName="profile_editor_nickname_field"
            onPress={() =>
              navigation.navigate('ProfileEditor/Detail', {
                field: 'nickname',
              })
            }>
            <FieldLabel>닉네임</FieldLabel>
            <FieldValueWrapper>
              <FieldValue>{userInfo?.nickname}</FieldValue>
              <GotoIcon />
            </FieldValueWrapper>
          </FieldArea>
          <FieldArea
            elementName="profile_editor_email_field"
            onPress={() =>
              navigation.navigate('ProfileEditor/Detail', {
                field: 'email',
              })
            }>
            <FieldLabel>이메일</FieldLabel>
            <FieldValueWrapper>
              <FieldValue>{userInfo?.email}</FieldValue>
              <GotoIcon />
            </FieldValueWrapper>
          </FieldArea>
          <FieldArea
            elementName="profile_editor_birth_year_field"
            onPress={() =>
              navigation.navigate('ProfileEditor/Detail', {
                field: 'birthYear',
              })
            }>
            <FieldLabel>태어난 해</FieldLabel>
            <FieldValueWrapper>
              <FieldValue>
                {userInfo?.birthYear
                  ? `${userInfo?.birthYear.toString()}년`
                  : ''}
              </FieldValue>
              <GotoIcon />
            </FieldValueWrapper>
          </FieldArea>
          <FieldArea
            elementName="profile_editor_mobility_tools_field"
            onPress={() =>
              navigation.navigate('ProfileEditor/Detail', {
                field: 'mobilityTools',
              })
            }>
            <FieldLabel>나의 이동유형</FieldLabel>
            <FieldValueWrapper>
              <FieldValue numberOfLines={1}>
                {userInfo?.mobilityTools
                  .map(tool => MOBILITY_TOOL_LABELS[tool])
                  .join(', ')}
              </FieldValue>
              <GotoIcon />
            </FieldValueWrapper>
          </FieldArea>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const FieldArea = styled(SccTouchableOpacity)`
  padding: 20px;
  gap: 8px;
  flex-direction: column;
  align-items: stretch;
`;

const FieldLabel = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray50};
`;

const FieldValueWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
`;

const FieldValue = styled.Text`
  flex-shrink: 1;
  font-size: 16px;
  font-family: ${font.pretendardMedium};
  color: ${color.black};
`;
