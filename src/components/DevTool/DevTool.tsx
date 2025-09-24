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
import {useAtom, useSetAtom} from 'jotai';
import {loggedEventsAtom} from './devToolEventStore';
import {initializeEventLoggingDevTool} from '@/logging/Logger';
import {accessTokenAtom} from '@/atoms/Auth';

interface DevToolProps {
}

/**
 * Determines whether DevTool should be shown based on environment
 * @returns true if DevTool should be visible (local dev or sandbox with ENABLE_DEVTOOL=true)
 */
export const shouldShowDevTool = (): boolean => {
  return __DEV__ || Config.ENABLE_DEVTOOL === 'true';
};

export const DevTool: React.FC<DevToolProps> = () => {

  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isEventLoggingSheetOpen, setIsEventLoggingSheetOpen] = useState(false);
  const [config, setConfig] = useDevToolConfig();
  const setLoggedEvents = useSetAtom(loggedEventsAtom);
  const [accessToken] = useAtom(accessTokenAtom);

  // Initialize event logging (enabled in dev or sandbox)
  useEffect(() => {
    if (shouldShowDevTool()) {
      initializeEventLoggingDevTool(setLoggedEvents);
    }
  }, []);

  // Floating button position
  const pan = useRef(
    new Animated.ValueXY({
      x: screenWidth - 70,
      y: screenHeight - 150 - insets.bottom,
    }),
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.extractOffset();
      },
      onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
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
          {
            transform: pan.getTranslateTransform(),
          },
        ]}
        {...panResponder.panHandlers}>
        <TouchableOpacity
          onPress={toggleBottomSheet}
          style={styles.floatingButtonTouchable}>
          <Text style={styles.floatingButtonText}>DEV</Text>
        </TouchableOpacity>
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
                  <Text style={styles.bottomSheetTitle}>DevTool Settings</Text>
                  <TouchableOpacity onPress={toggleBottomSheet}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.bottomSheetContent}>
                  {/* Search Radius Toggle */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>
                        Show Search Radius
                      </Text>
                      <Text style={styles.settingDescription}>
                        Display search range circle on map when calling
                        /searchPlaces API
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
                      <Text style={styles.settingLabel}>Event Logs</Text>
                      <Text style={styles.settingDescription}>
                        View realtime client events for QA testing
                      </Text>
                    </View>
                    <View style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>View Logs</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Access Token Copy Button */}
                  <TouchableOpacity
                    style={styles.actionRow}
                    onPress={handleCopyAccessToken}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Access Token</Text>
                      <Text style={styles.settingDescription}>
                        Copy current access token to clipboard for API testing
                      </Text>
                    </View>
                    <View style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Copy Token</Text>
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
