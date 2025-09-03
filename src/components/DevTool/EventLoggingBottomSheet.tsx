import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import {useAtom} from 'jotai';
import {loggedEventsAtom} from './devToolEventStore';

interface EventLoggingBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const EventLoggingBottomSheet: React.FC<EventLoggingBottomSheetProps> = ({
  visible,
  onClose,
}) => {
  const [loggedEvents, setLoggedEvents] = useAtom(loggedEventsAtom);

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

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalBackground} />
        </TouchableWithoutFeedback>
        <SafeAreaView style={styles.bottomSheet}>
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
                    <Text style={styles.eventTime}>{formatTime(event.timestamp)}</Text>
                  </View>
                  <Text style={styles.eventParams}>{formatParams(event.params)}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
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
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
  },
  eventParams: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'Courier New',
  },
});