import React, {useEffect} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';
import useAppComponents from '@/hooks/useAppComponents';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ToastUtils from '@/utils/ToastUtils';

export type ResolvingSccContentScreenParams = {
  sccContentId: string;
};

type Props = ScreenProps<'ResolvingSccContent'>;

export default function ResolvingSccContentScreen({navigation, route}: Props) {
  const {sccContentId} = route.params;
  const {api} = useAppComponents();

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      try {
        const res = await api.getSccContent({sccContentId});
        const data = res.data;
        if (cancelled) {
          return;
        }
        navigation.replace('Webview', {
          url: data.url,
          fixedTitle: data.webPageDetail?.title ?? undefined,
        });
      } catch {
        if (!cancelled) {
          ToastUtils.show('컨텐츠를 찾지 못했어요');
          navigation.goBack();
        }
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [sccContentId, api, navigation]);

  return (
    <ScreenLayout isHeaderVisible={false}>
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>
          {'컨텐츠를 불러오는 중입니다\n잠시만 기다려주세요...'}
        </Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16},
  message: {fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22},
});
