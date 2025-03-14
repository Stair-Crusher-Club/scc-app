import {useEffect, useState} from 'react';

import {UserMobilityToolDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {delay} from '@/utils/time';

export interface UserFormValue {
  nickname: string;
  email: string;
  birthYear: string;
  mobilityTools: UserMobilityToolDto[];
  isNewsLetterSubscriptionAgreed: boolean;
}
export type UserFormState = {
  [K in keyof UserFormValue]?: FormState;
};

export type FormState = 'VALID' | 'PROGRESS' | {errorMessage: string};

export function useUpdateUser({
  initialValues,
  accessToken,
}: {
  initialValues?: UserFormValue;
  accessToken?: string; // 회원가입 시나리오에서는 로컬에 access token 을 저장하지 않는다. 따라서 회원가입 시나리오에서는 이 값을 넘겨준다.
}) {
  const {api} = useAppComponents();
  const initialFormValues = initialValues ?? {
    nickname: '',
    email: '',
    birthYear: '',
    mobilityTools: [],
    isNewsLetterSubscriptionAgreed: false,
  };
  const [formValue, setFormValue] = useState<UserFormValue>(initialFormValues);
  const [formState, setFormState] = useState<UserFormState>({});

  const validateNickname = async (
    nickname: string,
  ): Promise<string | undefined> => {
    if (nickname.length < 2) {
      return '닉네임은 최소 2글자 이상이어야 합니다.';
    }
    if (nickname.length > 15) {
      return '닉네임은 최대 15글자 이하여야 합니다.';
    }
    if (!/^[a-zA-Z가-힣0-9]+$/.test(nickname)) {
      return '닉네임은 영어, 한글, 숫자만 사용 가능해요.';
    }

    try {
      await delay(200);
      const response = await api.validateUserProfilePost(
        {
          nickname,
        },
        {
          headers: {
            ...(accessToken && {
              Authorization: `Bearer ${accessToken}`,
            }),
          },
        },
      );
      if (response.data.nicknameErrorMessage) {
        return response.data.nicknameErrorMessage;
      }
    } catch (error) {
      console.error(error);
      return '중복 확인에 실패했어요. 잠시 후 다시 시도해주세요.';
    }
    return undefined;
  };

  const validateEmail = async (email: string): Promise<string | undefined> => {
    if (email.length < 6) {
      return '이메일은 최소 6글자 이상이어야 합니다.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return '올바른 이메일 형식을 입력해주세요.';
    }
    try {
      await delay(200);
      const response = await api.validateUserProfilePost(
        {
          email,
        },
        {
          headers: {
            ...(accessToken && {
              Authorization: `Bearer ${accessToken}`,
            }),
          },
        },
      );
      if (response.data.emailErrorMessage) {
        return response.data.emailErrorMessage;
      }
    } catch (error) {
      console.error(error);
      return '중복 확인에 실패했어요. 잠시 후 다시 시도해주세요.';
    }
    return undefined;
  };

  const validateBirthYear = (birthYear: string): string | undefined => {
    if (!birthYear) {
      return '출생연도를 선택해주세요.';
    }
    return undefined;
  };

  const validateMobilityTools = (
    mobilityTools: UserMobilityToolDto[],
  ): string | undefined => {
    if (mobilityTools.length === 0) {
      return '이동유형을 선택해주세요.';
    }
    return undefined;
  };

  // Validate nickname whenever it changes
  useEffect(() => {
    if (formValue.nickname === initialFormValues.nickname) {
      setFormState(prev => ({
        ...prev,
        nickname: undefined,
      }));
      return;
    }
    let isSubscribed = true;

    const validate = async () => {
      setFormState(prev => ({
        ...prev,
        nickname: 'PROGRESS',
      }));
      const error = await validateNickname(formValue.nickname);
      if (isSubscribed) {
        setFormState(prev => ({
          ...prev,
          nickname: error ? {errorMessage: error} : 'VALID',
        }));
      }
    };

    validate();

    return () => {
      isSubscribed = false;
    };
  }, [formValue.nickname]);

  // Validate email whenever it changes
  useEffect(() => {
    if (formValue.email === initialFormValues.email) {
      setFormState(prev => ({
        ...prev,
        email: undefined,
      }));
      return;
    }
    let isSubscribed = true;
    const validate = async () => {
      setFormState(prev => ({
        ...prev,
        email: 'PROGRESS',
      }));
      const error = await validateEmail(formValue.email);
      if (isSubscribed) {
        setFormState(prev => ({
          ...prev,
          email: error ? {errorMessage: error} : 'VALID',
        }));
      }
    };

    validate();

    return () => {
      isSubscribed = false;
    };
  }, [formValue.email]);
  // Validate birth year whenever it changes
  useEffect(() => {
    if (formValue.birthYear === initialFormValues.birthYear) {
      setFormState(prev => ({
        ...prev,
        birthYear: undefined,
      }));
      return;
    }
    const error = validateBirthYear(formValue.birthYear);
    setFormState(prev => ({
      ...prev,
      birthYear: error ? {errorMessage: error} : 'VALID',
    }));
  }, [formValue.birthYear]);

  useEffect(() => {
    if (formValue.mobilityTools === initialFormValues.mobilityTools) {
      setFormState(prev => ({
        ...prev,
        mobilityTools: undefined,
      }));
      return;
    }
    const error = validateMobilityTools(formValue.mobilityTools);
    setFormState(prev => ({
      ...prev,
      mobilityTools: error ? {errorMessage: error} : 'VALID',
    }));
  }, [formValue.mobilityTools]);

  const updateField = async (field: keyof UserFormValue, value: any) => {
    setFormValue(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const submit = async () => {
    const isAllFieldsValid = Object.values(formState).every(
      field => field === 'VALID' || field === undefined,
    );
    if (!isAllFieldsValid) {
      throw new Error('모든 필드가 유효하지 않습니다.');
    }

    const parsedBirthYear = formValue.birthYear
      ? parseInt(formValue.birthYear, 10)
      : undefined;
    if (parsedBirthYear && isNaN(parsedBirthYear)) {
      throw new Error('출생연도가 유효하지 않습니다.');
    }
    const user = (
      await api.updateUserInfoPost(
        {
          email: formValue.email,
          nickname: formValue.nickname,
          mobilityTools: formValue.mobilityTools,
          birthYear: parsedBirthYear,
          isNewsLetterSubscriptionAgreed:
            formValue.isNewsLetterSubscriptionAgreed,
        },
        {
          headers: accessToken
            ? {Authorization: `Bearer ${accessToken}`}
            : undefined,
        },
      )
    ).data.user;
    return user;
  };

  return {
    formValue,
    formState,
    updateField,
    submit,
  };
}
