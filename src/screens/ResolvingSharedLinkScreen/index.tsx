import React, {useEffect} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

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
            // Search는 MainScreen 탭 내부 화면이므로 navigate(크로스 네비게이터)로 이동
            navigation.navigate('Search', {
              initKeyword: data.fallbackQuery ?? undefined,
              toMap: false,
            });
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
