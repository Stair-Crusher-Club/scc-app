import React from 'react';
import {Pressable, View} from 'react-native';

import {useMe} from '@/atoms/Auth';
import {LogClick} from '@/logging/LogClick';
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
        <LogClick elementName="edit_profile_button">
          <Pressable onPress={openProfileEditorScreen}>
            <S.EditProfileButton>
              <S.ButtonText>프로필 수정</S.ButtonText>
            </S.EditProfileButton>
          </Pressable>
        </LogClick>
      </View>
    </S.MyProfileSection>
  );
}
