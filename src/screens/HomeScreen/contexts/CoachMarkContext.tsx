import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';
import {LayoutRectangle} from 'react-native';

export interface CoachMark {
  id: string;
  rx?: number;
  ry?: number;
  renderItem?: (layout: Omit<LayoutRectangle, 'height'>) => React.ReactNode;
}

export interface CoachMarkItem extends CoachMark, LayoutRectangle {
  renderItem?: (layout: Omit<LayoutRectangle, 'height'>) => React.ReactNode;
}

interface CoachMarkContextType {
  items: CoachMarkItem[];
  register: (props: CoachMarkItem) => void;
  clearRects: () => void;
}

const CoachMarkContext = createContext<CoachMarkContextType | undefined>(
  undefined,
);

export const CoachMarkProvider = ({children}: PropsWithChildren) => {
  const [items, setItems] = useState<CoachMarkItem[]>([]);

  const register = (props: CoachMarkItem) => {
    setItems(prev => {
      const next = prev.filter(r => r.id !== props.id);
      return [...next, {...props}];
    });
  };

  const clearRects = () => setItems([]);

  return (
    <CoachMarkContext.Provider value={{items, register, clearRects}}>
      {children}
    </CoachMarkContext.Provider>
  );
};

export const useCoachMark = (): CoachMarkContextType => {
  const context = useContext(CoachMarkContext);
  if (!context) {
    throw new Error('useCoachMark must be used within a CoachMarkProvider');
  }
  return context;
};
