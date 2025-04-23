import {atom, useAtom} from 'jotai';

export type RegisterCompleteEvent = 'submit-place' | 'submit-building';

export const registerCompleteEventState = atom<
  Map<string, RegisterCompleteEvent>
>(new Map());

export const useRegisterCompleteEventState = () => {
  const [state, setState] = useAtom(registerCompleteEventState);

  const registerCompleteEvent = (
    key: string,
  ): RegisterCompleteEvent | undefined => {
    return state.get(key);
  };

  const setRegisterCompleteEvent = (
    key: string,
    value: RegisterCompleteEvent | null,
  ) => {
    const newState = new Map(state);
    if (value) {
      newState.set(key, value);
    } else {
      newState.delete(key);
    }
    setState(newState);
  };

  return {registerCompleteEvent, setRegisterCompleteEvent};
};
