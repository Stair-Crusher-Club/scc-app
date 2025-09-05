import React from 'react';
import {View} from 'react-native';

import {useMe} from '@/atoms/Auth';
import {SccPressable} from '@/components/SccPressable';
import useNavigation from '@/navigation/useNavigation';

import * as S from './MyProfileSection.style';

export default function MyProfileSection() {
  const navigation = useNavigation();
  const {userInfo} = useMe();

  function openProfileEditorScreen() {
    navigation.navigate('ProfileEditor');
  }
  return (
    <S.MyProfileSection>
      <View>
        <S.Nickname>{userInfo?.nickname}</S.Nickname>
        <S.Email>{userInfo?.email}</S.Email>
      </View>
      <View>
        <SccPressable
          elementName="edit_profile_button"
          onPress={openProfileEditorScreen}>
          <S.EditProfileButton>
            <S.ButtonText>프로필 수정</S.ButtonText>
          </S.EditProfileButton>
        </SccPressable>
      </View>
    </S.MyProfileSection>
  );
}
