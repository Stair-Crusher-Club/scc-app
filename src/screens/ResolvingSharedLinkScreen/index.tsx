import React, {useEffect} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';
import useAppComponents from '@/hooks/useAppComponents';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {ResolveSharedPlaceLinkResultStatusDto} from '@/generated-sources/openapi';
import Logger from '@/logging/Logger';
import ToastUtils from '@/utils/ToastUtils';

export type ResolvingSharedLinkScreenParams = {
  sharedText: string;
};

type Props = ScreenProps<'ResolvingSharedLink'>;

export default function ResolvingSharedLinkScreen({navigation, route}: Props) {
  const {sharedText} = route.params;
  const {api} = useAppComponents();

  useEffect(() => {
    let cancelled = false;

    // 공유하기 기능 이용 1회 (userId는 GA user property + 이벤트 파라미터로 기록)
    Logger.logSharePlaceLinkUsed();

    async function resolve() {
      try {
        const res = await api.resolveSharedPlaceLinkPost({
          sharedText,
        });
        const data = res.data;
        if (cancelled) {
          return;
        }
        switch (data.status) {
          case ResolveSharedPlaceLinkResultStatusDto.Matched:
            navigation.replace('PlaceDetailV2', {
              placeInfo: {placeId: data.place!.place.id},
            });
            break;
          case ResolveSharedPlaceLinkResultStatusDto.Ambiguous: {
            // TODO: 바텀시트 후보 선택. 지금은 첫 번째 후보로 랜딩
            const firstCandidate = data.candidates?.[0];
            if (!firstCandidate) {
              navigation.goBack();
              break;
            }
            navigation.replace('PlaceDetailV2', {
              placeInfo: {placeId: firstCandidate.place.id},
            });
            break;
          }
          case ResolveSharedPlaceLinkResultStatusDto.NotFound:
            ToastUtils.show('공유된 장소를 찾지 못했어요.');
            navigation.goBack();
            break;
          default: {
            const _exhaustiveCheck: never = data.status;
            navigation.goBack();
            return _exhaustiveCheck;
          }
        }
      } catch {
        if (!cancelled) {
          navigation.goBack();
        }
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [sharedText, api, navigation]);

  return (
    <ScreenLayout isHeaderVisible={false}>
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>
          {'장소를 찾는 중입니다\n잠시만 기다려주세요...'}
        </Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16},
  message: {fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22},
});
