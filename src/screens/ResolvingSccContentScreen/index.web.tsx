import React, {useEffect} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';
import useAppComponents from '@/hooks/useAppComponents';
import {ScreenProps} from '@/navigation/Navigation.screens';
import ToastUtils from '@/utils/ToastUtils';

type Props = ScreenProps<'ResolvingSccContent'>;

/**
 * Web 전용 resolver. sccContentId → 원본 url 로 **현재 탭을 통째로** 이동한다.
 *
 * native 변형(index.tsx)처럼 `navigation.replace('Webview', ...)` 로 가지 않는 이유:
 * WebViewScreen.web 은 외부 도메인(con.staircrusher.club/notion 등) url 을
 * `window.open(_blank)` 로 새 탭에 열고 `goBack()` 한다. 공유 링크 랜딩은 사용자 제스처
 * 없는 effect 라 데스크톱에서 새 탭이 팝업 차단되고, goBack 은 히스토리가 없어 초기
 * 라우트(홈)로 떨어진다("/scc-content → /home" 버그). 랜딩은 현재 탭을 그대로 컨텐츠로
 * 보내야 하므로 `window.location.replace` 를 쓴다(외부·동일출처 모두 정상 이동).
 */
export default function ResolvingSccContentScreen({route}: Props) {
  const {sccContentId} = route.params;
  const {api} = useAppComponents();

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      try {
        const {data} = await api.getSccContent({sccContentId});
        if (cancelled) {
          return;
        }
        window.location.replace(data.url);
      } catch {
        if (cancelled) {
          return;
        }
        ToastUtils.show('컨텐츠를 찾지 못했어요');
        window.location.replace('/');
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [sccContentId, api]);

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
