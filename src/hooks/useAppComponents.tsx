import {useContext} from 'react';

import {AppComponentsContext} from '@/AppComponentsContext';

export default function useAppComponents() {
  return useContext(AppComponentsContext);
}
