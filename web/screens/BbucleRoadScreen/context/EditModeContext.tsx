import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { GetBbucleRoadPageResponseDto } from '@/generated-sources/openapi';

interface UndoAction {
  type: string;
  previousData: GetBbucleRoadPageResponseDto;
}

interface EditModeContextValue {
  /** Edit 모드 활성화 여부 */
  isEditMode: boolean;
  /** 현재 편집 중인 데이터 */
  data: GetBbucleRoadPageResponseDto;
  /** 데이터 업데이트 함수 */
  updateData: (
    updater: (
      prev: GetBbucleRoadPageResponseDto,
    ) => GetBbucleRoadPageResponseDto,
  ) => void;
  /** 데이터 전체 교체 (JSON import용) */
  setData: (newData: GetBbucleRoadPageResponseDto) => void;
  /** Undo 스택 */
  undoStack: UndoAction[];
  /** Undo 실행 */
  undo: () => void;
  /** Undo 가능 여부 */
  canUndo: boolean;
  /** 현재 데이터를 JSON 문자열로 반환 */
  exportToJson: () => string;
  /** JSON 문자열로부터 데이터 import */
  importFromJson: (json: string) => boolean;
}

const EditModeContext = createContext<EditModeContextValue | null>(null);

interface EditModeProviderProps {
  children: ReactNode;
  isEditMode: boolean;
  initialData: GetBbucleRoadPageResponseDto;
}

export function EditModeProvider({
  children,
  isEditMode,
  initialData,
}: EditModeProviderProps) {
  const [data, setDataState] =
    useState<GetBbucleRoadPageResponseDto>(initialData);
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);

  const pushToUndoStack = useCallback(
    (actionType: string, previousData: GetBbucleRoadPageResponseDto) => {
      setUndoStack((prev) => [
        ...prev.slice(-49), // 최대 50개 유지
        { type: actionType, previousData },
      ]);
    },
    [],
  );

  const updateData = useCallback(
    (
      updater: (
        prev: GetBbucleRoadPageResponseDto,
      ) => GetBbucleRoadPageResponseDto,
    ) => {
      setDataState((prev) => {
        pushToUndoStack('update', prev);
        return updater(prev);
      });
    },
    [pushToUndoStack],
  );

  const setData = useCallback(
    (newData: GetBbucleRoadPageResponseDto) => {
      setDataState((prev) => {
        pushToUndoStack('replace', prev);
        return newData;
      });
    },
    [pushToUndoStack],
  );

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setDataState(lastAction.previousData);
  }, [undoStack]);

  const canUndo = undoStack.length > 0;

  const exportToJson = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importFromJson = useCallback(
    (json: string): boolean => {
      try {
        const parsed = JSON.parse(json) as GetBbucleRoadPageResponseDto;
        // 기본 유효성 검사
        if (!parsed.id || typeof parsed.id !== 'string') {
          console.error('Invalid JSON: missing or invalid id');
          return false;
        }
        setData(parsed);
        return true;
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        return false;
      }
    },
    [setData],
  );

  const value = useMemo<EditModeContextValue>(
    () => ({
      isEditMode,
      data,
      updateData,
      setData,
      undoStack,
      undo,
      canUndo,
      exportToJson,
      importFromJson,
    }),
    [
      isEditMode,
      data,
      updateData,
      setData,
      undoStack,
      undo,
      canUndo,
      exportToJson,
      importFromJson,
    ],
  );

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
}

/**
 * Edit Mode Context 사용 hook
 * @returns EditModeContextValue 또는 null (edit mode가 아닐 때)
 */
export function useEditMode(): EditModeContextValue | null {
  return useContext(EditModeContext);
}

/**
 * Edit Mode Context 사용 hook (반드시 edit mode일 때만 사용)
 * @throws EditModeProvider 내부가 아닐 때 에러
 */
export function useEditModeRequired(): EditModeContextValue {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error('useEditModeRequired must be used within EditModeProvider');
  }
  return context;
}
