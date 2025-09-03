import {atom} from 'jotai';

export interface DevToolLoggedEvent {
  id: string;
  timestamp: number;
  eventName: string;
  params: Record<string, any>;
}

// Store for logged events (max 200)
export const loggedEventsAtom = atom<DevToolLoggedEvent[]>([]);

// Helper to add event to store
export const convertToDevToolLoggedEvent = (
  events: DevToolLoggedEvent[],
  newEvent: Omit<DevToolLoggedEvent, 'id' | 'timestamp'>,
): DevToolLoggedEvent[] => {
  const event: DevToolLoggedEvent = {
    ...newEvent,
    id: `${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
  };
  
  // Keep only last 200 events
  const updatedEvents = [event, ...events].slice(0, 200);
  return updatedEvents;
};