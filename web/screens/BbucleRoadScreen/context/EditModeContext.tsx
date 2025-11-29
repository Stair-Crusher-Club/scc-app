import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  GetBbucleRoadPageResponseDto,
  BbucleRoadPolygonPointDto,
} from '@/generated-sources/openapi';

interface UndoAction {
  type: string;
  previousData: GetBbucleRoadPageResponseDto;
}

/** Region 편집 상태 */
export interface EditingRegionState {
  /** 어떤 route의 interactive image인지 */
  routeIndex: number;
  /** 기존 region 편집 시 index, 새 region 추가 시 null */
  regionIndex: number | null;
  /** 편집 중인 polygon 점들 */
  points: BbucleRoadPolygonPointDto[];
  /** 모달에 표시할 이미지 URL들 */
  modalImageUrls: string[];
  /** 실행취소를 위한 이전 points 스택 */
  pointsUndoStack: BbucleRoadPolygonPointDto[][];
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

  // === Region 편집 관련 ===
  /** 현재 편집 중인 region 상태 */
  editingRegion: EditingRegionState | null;
  /** 새 region 편집 시작 */
  startAddingRegion: (routeIndex: number) => void;
  /** 기존 region 편집 시작 */
  startEditingRegion: (
    routeIndex: number,
    regionIndex: number,
    points: BbucleRoadPolygonPointDto[],
    modalImageUrls: string[],
  ) => void;
  /** 편집 중인 region에 점 추가 */
  addPointToRegion: (point: BbucleRoadPolygonPointDto) => void;
  /** 편집 중인 region에서 점 제거 */
  removePointFromRegion: (pointIndex: number) => void;
  /** 편집 중인 region의 점들 초기화 */
  clearRegionPoints: () => void;
  /** 편집 중인 region의 점 실행취소 */
  undoRegionPoint: () => void;
  /** 편집 중인 region의 모달 이미지 추가 */
  addModalImageToRegion: (url: string) => void;
  /** 편집 중인 region의 모달 이미지 제거 */
  removeModalImageFromRegion: (index: number) => void;
  /** region 편집 저장 */
  saveEditingRegion: () => void;
  /** region 편집 취소 */
  cancelEditingRegion: () => void;
  /** region 삭제 */
  deleteRegion: (routeIndex: number, regionIndex: number) => void;
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
  const [editingRegion, setEditingRegion] = useState<EditingRegionState | null>(
    null,
  );

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

  // === Region 편집 메서드들 ===

  const startAddingRegion = useCallback((routeIndex: number) => {
    setEditingRegion({
      routeIndex,
      regionIndex: null,
      points: [],
      modalImageUrls: [],
      pointsUndoStack: [],
    });
  }, []);

  const startEditingRegion = useCallback(
    (
      routeIndex: number,
      regionIndex: number,
      points: BbucleRoadPolygonPointDto[],
      modalImageUrls: string[],
    ) => {
      setEditingRegion({
        routeIndex,
        regionIndex,
        points: [...points],
        modalImageUrls: [...modalImageUrls],
        pointsUndoStack: [],
      });
    },
    [],
  );

  const addPointToRegion = useCallback((point: BbucleRoadPolygonPointDto) => {
    setEditingRegion((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pointsUndoStack: [...prev.pointsUndoStack.slice(-49), prev.points],
        points: [...prev.points, point],
      };
    });
  }, []);

  const removePointFromRegion = useCallback((pointIndex: number) => {
    setEditingRegion((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pointsUndoStack: [...prev.pointsUndoStack.slice(-49), prev.points],
        points: prev.points.filter((_, i) => i !== pointIndex),
      };
    });
  }, []);

  const clearRegionPoints = useCallback(() => {
    setEditingRegion((prev) => {
      if (!prev || prev.points.length === 0) return prev;
      return {
        ...prev,
        pointsUndoStack: [...prev.pointsUndoStack.slice(-49), prev.points],
        points: [],
      };
    });
  }, []);

  const undoRegionPoint = useCallback(() => {
    setEditingRegion((prev) => {
      if (!prev || prev.pointsUndoStack.length === 0) return prev;
      const previousPoints = prev.pointsUndoStack[prev.pointsUndoStack.length - 1];
      return {
        ...prev,
        points: previousPoints,
        pointsUndoStack: prev.pointsUndoStack.slice(0, -1),
      };
    });
  }, []);

  const addModalImageToRegion = useCallback((url: string) => {
    setEditingRegion((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        modalImageUrls: [...prev.modalImageUrls, url],
      };
    });
  }, []);

  const removeModalImageFromRegion = useCallback((index: number) => {
    setEditingRegion((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        modalImageUrls: prev.modalImageUrls.filter((_, i) => i !== index),
      };
    });
  }, []);

  const saveEditingRegion = useCallback(() => {
    if (!editingRegion) return;
    if (editingRegion.points.length < 3) {
      alert('최소 3개의 점이 필요합니다.');
      return;
    }

    const { routeIndex, regionIndex, points, modalImageUrls } = editingRegion;

    updateData((prev) => {
      if (!prev.routeSection?.routes) return prev;

      const newRoutes = [...prev.routeSection.routes];
      const route = newRoutes[routeIndex];
      if (!route?.interactiveImage) return prev;

      const currentRegions = route.interactiveImage.clickableRegions || [];

      if (regionIndex !== null) {
        // 기존 region 수정
        const newRegions = currentRegions.map((region, i) =>
          i === regionIndex ? { ...region, polygon: points, modalImageUrls } : region,
        );
        newRoutes[routeIndex] = {
          ...route,
          interactiveImage: {
            ...route.interactiveImage,
            clickableRegions: newRegions,
          },
        };
      } else {
        // 새 region 추가
        const newRegion = {
          id: `region-${Date.now()}`,
          polygon: points,
          modalImageUrls,
        };
        newRoutes[routeIndex] = {
          ...route,
          interactiveImage: {
            ...route.interactiveImage,
            clickableRegions: [...currentRegions, newRegion],
          },
        };
      }

      return {
        ...prev,
        routeSection: {
          ...prev.routeSection,
          routes: newRoutes,
        },
      };
    });

    setEditingRegion(null);
  }, [editingRegion, updateData]);

  const cancelEditingRegion = useCallback(() => {
    setEditingRegion(null);
  }, []);

  const deleteRegion = useCallback(
    (routeIndex: number, regionIndex: number) => {
      updateData((prev) => {
        if (!prev.routeSection?.routes) return prev;

        const newRoutes = [...prev.routeSection.routes];
        const route = newRoutes[routeIndex];
        if (!route?.interactiveImage) return prev;

        const currentRegions = route.interactiveImage.clickableRegions || [];
        const newRegions = currentRegions.filter((_, i) => i !== regionIndex);

        newRoutes[routeIndex] = {
          ...route,
          interactiveImage: {
            ...route.interactiveImage,
            clickableRegions: newRegions,
          },
        };

        return {
          ...prev,
          routeSection: {
            ...prev.routeSection,
            routes: newRoutes,
          },
        };
      });
    },
    [updateData],
  );

  // Cmd+Z 키보드 이벤트 (region 편집 중일 때)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && editingRegion) {
        e.preventDefault();
        undoRegionPoint();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [editingRegion, undoRegionPoint]);

  // 저장하지 않고 이탈 시 경고
  useEffect(() => {
    if (!isEditMode) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (undoStack.length > 0) {
        e.preventDefault();
        e.returnValue = '저장되지 않은 변경사항이 있습니다. 페이지를 떠나시겠습니까?';
        return e.returnValue;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [isEditMode, undoStack.length]);

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
      // Region 편집 관련
      editingRegion,
      startAddingRegion,
      startEditingRegion,
      addPointToRegion,
      removePointFromRegion,
      clearRegionPoints,
      undoRegionPoint,
      addModalImageToRegion,
      removeModalImageFromRegion,
      saveEditingRegion,
      cancelEditingRegion,
      deleteRegion,
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
      editingRegion,
      startAddingRegion,
      startEditingRegion,
      addPointToRegion,
      removePointFromRegion,
      clearRegionPoints,
      undoRegionPoint,
      addModalImageToRegion,
      removeModalImageFromRegion,
      saveEditingRegion,
      cancelEditingRegion,
      deleteRegion,
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
