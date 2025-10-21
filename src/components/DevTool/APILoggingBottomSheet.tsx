import React, {useRef, useState} from 'react';
/* eslint-disable no-restricted-imports */
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Clipboard,
  Alert,
} from 'react-native';

import {useAtom} from 'jotai';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import {apiLogsAtom, DevToolAPILog} from './devToolEventStore';

interface APILoggingBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const APILoggingBottomSheet: React.FC<APILoggingBottomSheetProps> = ({
  visible,
  onClose,
}) => {
  const [apiLogs, setAPILogs] = useAtom(apiLogsAtom);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
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

  const clearLogs = () => {
    setAPILogs([]);
    setExpandedLogId(null);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + `.${date.getMilliseconds().toString().padStart(3, '0')}`
    );
  };

  const formatJSON = (data: any) => {
    if (data === null || data === undefined) return 'null';
    if (typeof data === 'string') return data;
    return JSON.stringify(data, null, 2);
  };

  const getStatusColor = (status?: number, hasError?: boolean) => {
    if (hasError) return '#F44336'; // ERROR - 빨간색
    if (!status) return '#9E9E9E'; // PENDING - 회색
    if (status >= 200 && status < 300) return '#4CAF50'; // 2xx - 초록색
    if (status >= 300 && status < 400) return '#FF9800'; // 3xx - 주황색
    if (status >= 400) return '#F44336'; // 4xx, 5xx - 빨간색
    return '#666';
  };

  const getPathFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname + urlObj.search;
    } catch {
      // URL 파싱에 실패하면 전체 URL에서 도메인 부분만 제거
      return url.replace(/^https?:\/\/[^\/]+/, '');
    }
  };

  const toggleExpanded = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  const copyToClipboard = async (content: any, label: string) => {
    try {
      const textToCopy =
        typeof content === 'string'
          ? content
          : JSON.stringify(content, null, 2);
      await Clipboard.setString(textToCopy);
      Alert.alert('복사 완료', `${label}가 클립보드에 복사되었습니다.`);
    } catch (e) {
      Alert.alert('복사 실패', '클립보드에 복사하는데 실패했습니다.');
    }
  };

  const renderAPILog = (log: DevToolAPILog) => {
    const isExpanded = expandedLogId === log.id;

    return (
      <TouchableOpacity
        key={log.id}
        style={styles.logItem}
        onPress={() => toggleExpanded(log.id)}>
        <View style={styles.logHeader}>
          <View style={styles.logHeaderLeft}>
            <Text style={styles.method}>{log.method}</Text>
            <Text style={styles.url} numberOfLines={isExpanded ? undefined : 1}>
              {isExpanded ? log.url : getPathFromUrl(log.url)}
            </Text>
          </View>
          <View style={styles.logHeaderRight}>
            <Text
              style={[
                styles.status,
                {color: getStatusColor(log.responseStatus, !!log.error)},
              ]}>
              {log.responseStatus || (log.error ? 'ERROR' : 'PENDING')}
            </Text>
            <Text style={styles.time}>{formatTime(log.timestamp)}</Text>
            {log.duration && (
              <Text style={styles.duration}>{log.duration}ms</Text>
            )}
          </View>
        </View>

        {isExpanded && (
          <View style={styles.logDetails}>
            {log.requestHeaders && (
              <TouchableOpacity
                style={styles.section}
                onPress={() =>
                  copyToClipboard(log.requestHeaders, 'Request Headers')
                }>
                <Text style={styles.sectionTitle}>
                  Request Headers: (터치해서 복사)
                </Text>
                <Text style={styles.jsonText}>
                  {formatJSON(log.requestHeaders)}
                </Text>
              </TouchableOpacity>
            )}

            {log.requestBody && (
              <TouchableOpacity
                style={styles.section}
                onPress={() =>
                  copyToClipboard(log.requestBody, 'Request Body')
                }>
                <Text style={styles.sectionTitle}>
                  Request Body: (터치해서 복사)
                </Text>
                <Text style={styles.jsonText}>
                  {formatJSON(log.requestBody)}
                </Text>
              </TouchableOpacity>
            )}

            {log.responseHeaders && (
              <TouchableOpacity
                style={styles.section}
                onPress={() =>
                  copyToClipboard(log.responseHeaders, 'Response Headers')
                }>
                <Text style={styles.sectionTitle}>
                  Response Headers: (터치해서 복사)
                </Text>
                <Text style={styles.jsonText}>
                  {formatJSON(log.responseHeaders)}
                </Text>
              </TouchableOpacity>
            )}

            {log.responseBody && (
              <TouchableOpacity
                style={styles.section}
                onPress={() =>
                  copyToClipboard(log.responseBody, 'Response Body')
                }>
                <Text style={styles.sectionTitle}>
                  Response Body: (터치해서 복사)
                </Text>
                <Text style={styles.jsonText}>
                  {formatJSON(log.responseBody)}
                </Text>
              </TouchableOpacity>
            )}

            {log.error && (
              <TouchableOpacity
                style={styles.section}
                onPress={() => copyToClipboard(log.error, 'Error')}>
                <Text style={[styles.sectionTitle, {color: '#F44336'}]}>
                  Error: (터치해서 복사)
                </Text>
                <Text style={[styles.jsonText, {color: '#F44336'}]}>
                  {log.error}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const lastOffset = useRef({x: 20, y: 100});

  const onGestureEvent = Animated.event(
    [{nativeEvent: {translationX: translateX, translationY: translateY}}],
    {useNativeDriver: false},
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      lastOffset.current = {
        x: (translateX as any)._value,
        y: (translateY as any)._value,
      };
      translateX.setOffset(lastOffset.current.x);
      translateY.setOffset(lastOffset.current.y);
      translateX.setValue(0);
      translateY.setValue(0);
    } else if (event.nativeEvent.state === State.END) {
      translateX.flattenOffset();
      translateY.flattenOffset();

      const finalX = lastOffset.current.x + event.nativeEvent.translationX;
      const finalY = lastOffset.current.y + event.nativeEvent.translationY;

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
          <Text style={styles.title}>API Logs ({apiLogs.length})</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={clearLogs} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.logsList}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}>
          {apiLogs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No API calls logged yet</Text>
            </View>
          ) : (
            apiLogs.map(renderAPILog)
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
    width: 350,
    height: 500,
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
  logsList: {
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
  logItem: {
    marginBottom: 8,
    backgroundColor: 'rgba(245, 245, 245, 0.9)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(224, 224, 224, 0.7)',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  logHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  logHeaderRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  method: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 2,
  },
  url: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'Courier New',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  time: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  duration: {
    fontSize: 10,
    color: '#9C27B0',
    fontWeight: '600',
  },
  logDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(224, 224, 224, 0.7)',
    padding: 12,
  },
  section: {
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(240, 240, 240, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 200, 0.3)',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  jsonText: {
    fontSize: 10,
    color: '#333',
    fontFamily: 'Courier New',
    lineHeight: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});
