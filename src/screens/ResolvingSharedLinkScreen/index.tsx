import React, {useEffect} from 'react';
import {ActivityIndicator, Alert, StyleSheet, View} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';
import useAppComponents from '@/hooks/useAppComponents';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {ResolveSharedPlaceLinkResultStatusDto} from '@/generated-sources/openapi';

export type ResolvingSharedLinkScreenParams = {
  sharedText: string;
};

type Props = ScreenProps<'ResolvingSharedLink'>;

export default function ResolvingSharedLinkScreen({navigation, route}: Props) {
  const {sharedText} = route.params;
  const {api} = useAppComponents();

  useEffect(() => {
    let cancelled = false;

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
            Alert.alert('장소를 찾을 수 없어요', '공유된 장소를 찾지 못했어요. 직접 검색해 주세요.');
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
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
