import React, {useRef, useState} from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Switch,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDevToolConfig} from './useDevTool';

interface DevToolProps {
  isVisible?: boolean;
}

export const DevTool: React.FC<DevToolProps> = ({isVisible = true}) => {
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [config, setConfig] = useDevToolConfig();

  // Floating button position
  const pan = useRef(
    new Animated.ValueXY({
      x: screenWidth - 70,
      y: screenHeight - 150 - insets.bottom,
    }),
  ).current;

  // Bottom sheet animation
  const bottomSheetHeight = useRef(new Animated.Value(0)).current;

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
    const toValue = isBottomSheetOpen ? 0 : 300;
    Animated.spring(bottomSheetHeight, {
      toValue,
      useNativeDriver: false,
      tension: 50,
      friction: 10,
    }).start();
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

  if (!isVisible || !__DEV__) {
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

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: bottomSheetHeight,
            bottom: insets.bottom,
          },
        ]}>
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
              <Text style={styles.settingLabel}>Show Search Radius</Text>
              <Text style={styles.settingDescription}>
                Display search range circle on map when calling /searchPlaces
                API
              </Text>
            </View>
            <Switch
              value={config.searchRegion.enabled}
              onValueChange={handleSearchRadiusToggle}
              trackColor={{false: '#767577', true: '#81b0ff'}}
              thumbColor={config.searchRegion.enabled ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          {/* Add more dev tool options here */}
        </ScrollView>
      </Animated.View>
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
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 10,
    zIndex: 9999,
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
});

export default DevTool;
