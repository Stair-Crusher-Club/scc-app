import React, {useRef} from 'react';
/* eslint-disable no-restricted-imports */
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';

import {useAtom} from 'jotai';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import {loggedEventsAtom} from './devToolEventStore';

interface EventLoggingBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const EventLoggingBottomSheet: React.FC<
  EventLoggingBottomSheetProps
> = ({visible, onClose}) => {
  const [loggedEvents, setLoggedEvents] = useAtom(loggedEventsAtom);
  const translateX = useRef(new Animated.Value(20)).current;
  const translateY = useRef(new Animated.Value(100)).current;

  // Reset position when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      translateX.setValue(20);
      translateY.setValue(100);
      lastOffset.current = {x: 20, y: 100};
    }
  }, [visible]);

  const clearEvents = () => {
    setLoggedEvents([]);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatParams = (params: Record<string, any>) => {
    return JSON.stringify(params, null, 2);
  };

  const lastOffset = useRef({x: 20, y: 100});

  const onGestureEvent = Animated.event(
    [{nativeEvent: {translationX: translateX, translationY: translateY}}],
    {useNativeDriver: false},
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      // Store current position as offset
      lastOffset.current = {
        x: (translateX as any)._value,
        y: (translateY as any)._value,
      };
      translateX.setOffset(lastOffset.current.x);
      translateY.setOffset(lastOffset.current.y);
      translateX.setValue(0);
      translateY.setValue(0);
    } else if (event.nativeEvent.state === State.END) {
      // Flatten the offset into the value
      translateX.flattenOffset();
      translateY.flattenOffset();

      // Get final position without bounds - allow dragging anywhere
      const finalX = lastOffset.current.x + event.nativeEvent.translationX;
      const finalY = lastOffset.current.y + event.nativeEvent.translationY;

      // Update position without any bounds checking
      lastOffset.current = {x: finalX, y: finalY};
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.modalContainer} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.floatingPanel,
          {
            left: translateX,
            top: translateY,
          },
        ]}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          shouldCancelWhenOutside={false}
          activeOffsetX={[-10, 10]}
          activeOffsetY={[-10, 10]}>
          <Animated.View style={styles.dragHandle}>
            <View style={styles.dragIndicator} />
          </Animated.View>
        </PanGestureHandler>

        <View style={styles.header}>
          <Text style={styles.title}>Event Logs ({loggedEvents.length})</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={clearEvents} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.eventsList}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}>
          {loggedEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No events logged yet</Text>
            </View>
          ) : (
            loggedEvents.map(event => (
              <View key={event.id} style={styles.eventItem}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventName}>{event.eventName}</Text>
                  <Text style={styles.eventTime}>
                    {formatTime(event.timestamp)}
                  </Text>
                </View>
                <Text style={styles.eventParams}>
                  {formatParams(event.params)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  floatingPanel: {
    position: 'absolute',
    width: 320,
    height: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  dragHandle: {
    width: '100%',
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  dragIndicator: {
    width: 50,
    height: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.7)',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff5722',
    borderRadius: 4,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#999',
    fontSize: 14,
  },
  eventItem: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: 'rgba(245, 245, 245, 0.9)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(224, 224, 224, 0.7)',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  eventName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  eventTime: {
    fontSize: 11,
    color: '#666',
  },
  eventParams: {
    fontSize: 10,
    color: '#333',
    fontFamily: 'Courier New',
    lineHeight: 14,
  },
});
