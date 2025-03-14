import {atom, useRecoilState} from 'recoil';

export type RegisterCompleteEvent = 'submit-place' | 'submit-building';

export const registerCompleteEventState = atom<
  Map<string, RegisterCompleteEvent>
>({
  key: 'registerCompleteEventState',
  default: new Map<string, RegisterCompleteEvent>(),
});

export const useRegisterCompleteEventState = () => {
  const [state, setState] = useRecoilState(registerCompleteEventState);

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
