import {HotUpdater} from '@hot-updater/react-native';
import React from 'react';
import {Linking, Platform} from 'react-native';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';

import {color} from '@/constant/color';

import * as S from './Row.style';

export default function VersionRow() {
  const flavor = Config.FLAVOR ? ` - ${Config.FLAVOR}` : '';

  function goToStore() {
    if (Platform.OS === 'android') {
      Linking.openURL(
        'https://play.google.com/store/apps/details?id=club.staircrusher',
      );
    }
    if (Platform.OS === 'ios') {
      Linking.openURL('https://itunes.apple.com/app/id/6444382843');
    }
  }

  return (
    <S.Row>
      <S.SectionLabel>현재 버전</S.SectionLabel>
      <S.ValueRow>
        <S.ValueContent>
          <S.SectionValue>
            {`${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()}${flavor})`}
          </S.SectionValue>
          <S.SubtitleBundle>{HotUpdater.getBundleId()}</S.SubtitleBundle>
        </S.ValueContent>
        <S.ActionButton
          elementName="setting_version_store_button"
          activeOpacity={0.9}
          underlayColor={color.brandColor}
          onPress={goToStore}>
          <S.ActionButtonText>스토어로 이동</S.ActionButtonText>
        </S.ActionButton>
      </S.ValueRow>
    </S.Row>
  );
}
