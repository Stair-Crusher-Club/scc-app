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
import {useInterestedRegionsAndThemesCache} from '@/atoms/InterestedRegionsAndThemes';
import {useInterestedRegionGroupLabelMap} from '@/hooks/useListInterestedRegions';
import useNavigation from '@/navigation/useNavigation';
import {THEME_LABEL_BY_VALUE} from '@/screens/InterestedRegionAndThemesFormScreen';

export default function ProfileEditorScreen() {
  const {userInfo} = useMe();
  const {interestedRegionIds, interestedThemes} =
    useInterestedRegionsAndThemesCache();
  const regionLabelMap = useInterestedRegionGroupLabelMap();
  const navigation = useNavigation();

  const regionSummary =
    interestedRegionIds.length === 0
      ? null
      : interestedRegionIds.map(id => regionLabelMap[id] ?? id).join(', ');
  const themeSummary =
    interestedThemes.length === 0
      ? null
      : interestedThemes.map(theme => THEME_LABEL_BY_VALUE[theme]).join(', ');

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
          <FieldArea
            elementName="profile_editor_interested_region_field"
            onPress={() =>
              navigation.navigate('InterestedRegionAndThemes', {
                mode: 'region',
                initialRegionIds: interestedRegionIds,
                initialThemes: interestedThemes,
              })
            }>
            <FieldLabel>관심 지역</FieldLabel>
            <FieldValueWrapper>
              {regionSummary !== null ? (
                <FieldValue numberOfLines={1}>{regionSummary}</FieldValue>
              ) : (
                <FieldPlaceholder numberOfLines={1}>
                  관심 있는 지역을 알려주세요
                </FieldPlaceholder>
              )}
              <GotoIcon />
            </FieldValueWrapper>
          </FieldArea>
          <FieldArea
            elementName="profile_editor_interested_theme_field"
            onPress={() =>
              navigation.navigate('InterestedRegionAndThemes', {
                mode: 'theme',
                initialRegionIds: interestedRegionIds,
                initialThemes: interestedThemes,
              })
            }>
            <FieldLabel>관심 주제</FieldLabel>
            <FieldValueWrapper>
              {themeSummary !== null ? (
                <FieldValue numberOfLines={1}>{themeSummary}</FieldValue>
              ) : (
                <FieldPlaceholder numberOfLines={1}>
                  관심 있는 주제를 알려주세요
                </FieldPlaceholder>
              )}
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

/**
 * 관심 지역/주제가 선택되지 않은 상태의 placeholder 텍스트.
 * Figma 1648:40972 기준으로 brand 색(#0E64D3)으로 노출.
 */
const FieldPlaceholder = styled.Text`
  flex-shrink: 1;
  font-size: 16px;
  font-family: ${font.pretendardMedium};
  color: ${color.brand50};
`;
