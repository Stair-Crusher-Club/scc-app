import React, {useRef, useState, useEffect} from 'react';
/* eslint-disable no-restricted-imports */
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Switch,
  ScrollView,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Clipboard,
  Alert,
} from 'react-native';
import Config from 'react-native-config';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDevToolConfig} from './useDevTool';
import {EventLoggingBottomSheet} from './EventLoggingBottomSheet';
import {APILoggingBottomSheet} from './APILoggingBottomSheet';
import {useAtom, useSetAtom} from 'jotai';
import {
  loggedEventsAtom,
  apiLogsAtom,
  initializeAPILoggingDevTool,
} from './devToolEventStore';
import {initializeEventLoggingDevTool} from '@/logging/Logger';
import {accessTokenAtom} from '@/atoms/Auth';

interface DevToolProps {}

/**
 * Determines whether DevTool should be shown based on environment
 * @returns true if DevTool should be visible (local dev or sandbox with ENABLE_DEVTOOL=true)
 */
export const shouldShowDevTool = (): boolean => {
  return Config.ENABLE_DEVTOOL === 'true';
};

export const DevTool: React.FC<DevToolProps> = () => {
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isEventLoggingSheetOpen, setIsEventLoggingSheetOpen] = useState(false);
  const [isAPILoggingSheetOpen, setIsAPILoggingSheetOpen] = useState(false);
  const [config, setConfig] = useDevToolConfig();
  const setLoggedEvents = useSetAtom(loggedEventsAtom);
  const setAPILogs = useSetAtom(apiLogsAtom);
  const [accessToken] = useAtom(accessTokenAtom);

  // Initialize event logging and API logging (enabled in dev or sandbox)
  useEffect(() => {
    if (shouldShowDevTool()) {
      initializeEventLoggingDevTool(setLoggedEvents);
      initializeAPILoggingDevTool(setAPILogs);
    }
  }, []);

  // Floating button position
  const pan = useRef(
    new Animated.ValueXY({
      x: screenWidth - 70,
      y: screenHeight - 150 - insets.bottom,
    }),
  ).current;

  // Track movement distance to distinguish tap from drag
  const moveDistance = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        moveDistance.current = 0;
        pan.extractOffset();
      },
      onPanResponderMove: (_, gestureState) => {
        moveDistance.current = Math.sqrt(
          gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy,
        );
        Animated.event([null, {dx: pan.x, dy: pan.y}], {
          useNativeDriver: false,
        })(_, gestureState);
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        // If movement is less than 10px, treat as tap
        if (moveDistance.current < 10) {
          toggleBottomSheet();
        }
      },
    }),
  ).current;

  const toggleBottomSheet = () => {
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };

  const handleSearchRadiusToggle = (enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      searchRegion: {
        ...prev.searchRegion,
        enabled,
      },
    }));
  };

  const handleShowEventLogs = () => {
    setIsEventLoggingSheetOpen(true);
    setIsBottomSheetOpen(false);
  };

  const handleShowAPILogs = () => {
    setIsAPILoggingSheetOpen(true);
    setIsBottomSheetOpen(false);
  };

  const handleCopyAccessToken = async () => {
    try {
      if (!accessToken) {
        Alert.alert('알림', 'Access Token이 없습니다. 로그인을 확인해주세요.');
        return;
      }

      await Clipboard.setString(accessToken);
      Alert.alert('복사 완료', 'Access Token이 클립보드에 복사되었습니다.');
    } catch (_) {
      Alert.alert('오류', 'Access Token 복사에 실패했습니다.');
    }
  };

  if (!shouldShowDevTool()) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <Animated.View
        style={[
          styles.floatingButton,
          styles.floatingButtonTouchable,
          {
            transform: pan.getTranslateTransform(),
          },
        ]}
        {...panResponder.panHandlers}>
        <Text style={styles.floatingButtonText}>DEV</Text>
      </Animated.View>

      {/* Settings Modal */}
      <Modal
        visible={isBottomSheetOpen}
        animationType="none"
        transparent={true}
        onRequestClose={() => setIsBottomSheetOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsBottomSheetOpen(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <SafeAreaView style={styles.bottomSheet}>
                <View style={styles.bottomSheetHeader}>
                  <Text style={styles.bottomSheetTitle}>개발자 도구 설정</Text>
                  <TouchableOpacity onPress={toggleBottomSheet}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.bottomSheetContent}>
                  {/* Search Radius Toggle */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>검색 범위 표시</Text>
                      <Text style={styles.settingDescription}>
                        지도에서 장소를 검색할 때 검색 범위를 원으로 표시
                      </Text>
                    </View>
                    <Switch
                      value={config.searchRegion.enabled}
                      onValueChange={handleSearchRadiusToggle}
                      trackColor={{false: '#767577', true: '#81b0ff'}}
                      thumbColor={
                        config.searchRegion.enabled ? '#f5dd4b' : '#f4f3f4'
                      }
                    />
                  </View>

                  {/* Event Logging Button */}
                  <TouchableOpacity
                    style={styles.actionRow}
                    onPress={handleShowEventLogs}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>GA 이벤트</Text>
                      <Text style={styles.settingDescription}>
                        GA에 찍히는 클라이언트 이벤트 확인
                      </Text>
                    </View>
                    <View style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>이벤트 보기</Text>
                    </View>
                  </TouchableOpacity>

                  {/* API Logging Button */}
                  <TouchableOpacity
                    style={styles.actionRow}
                    onPress={handleShowAPILogs}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>서버 통신 로그</Text>
                      <Text style={styles.settingDescription}>
                        앱과 서버 간 데이터 송수신 내역 확인
                      </Text>
                    </View>
                    <View style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>로그 보기</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Access Token Copy Button */}
                  <TouchableOpacity
                    style={styles.actionRow}
                    onPress={handleCopyAccessToken}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>로그인 토큰 복사</Text>
                      <Text style={styles.settingDescription}>
                        현재 로그인 정보를 클립보드에 복사 (개발자용)
                      </Text>
                    </View>
                    <View style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>복사하기</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Add more dev tool options here */}
                </ScrollView>
              </SafeAreaView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Event Logging Bottom Sheet */}
      <EventLoggingBottomSheet
        visible={isEventLoggingSheetOpen}
        onClose={() => setIsEventLoggingSheetOpen(false)}
      />

      {/* API Logging Bottom Sheet */}
      <APILoggingBottomSheet
        visible={isAPILoggingSheetOpen}
        onClose={() => setIsAPILoggingSheetOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    zIndex: 10000,
  },
  floatingButtonTouchable: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 87, 34, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: '50%',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  bottomSheetContent: {
    flex: 1,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2196F3',
    borderRadius: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DevTool;
