# ESLint Migration Plan - Touchable Components

## Overview
Total warnings: **92 warnings** across **~45 files**

### Warning Types
1. **no-restricted-imports** (19 warnings): Direct imports of TouchableOpacity, Pressable, etc. from 'react-native'
2. **no-restricted-syntax** (73 warnings): Using styled.Pressable, styled.TouchableOpacity instead of styled(SccPressable), etc.

## Migration Strategy

### Phase 1: Scc Component Self-Imports (PRIORITY)
**Why First**: These components need to import from 'react-native' by design
**Files**: 4 files
- `src/components/SccPressable.tsx` - Import Pressable is necessary
- `src/components/SccTouchableOpacity.tsx` - Import TouchableOpacity is necessary  
- `src/components/SccTouchableHighlight.tsx` - Import TouchableHighlight is necessary
- `src/components/SccTouchableWithoutFeedback.tsx` - Import TouchableWithoutFeedback is necessary

**Solution**: Add ESLint disable comments for these specific imports

### Phase 2: Styled Components - Form Components
**Files**: 5 files, 6 warnings
- `src/components/form/MultiSelect.style.ts` - styled.Pressable → styled(SccPressable)
- `src/components/form/Options.style.ts` - styled.Pressable → styled(SccPressable)
- `src/components/form/Photos.style.ts` - 3x styled.Pressable → styled(SccPressable)
- `src/components/form/UserEmailForm.tsx` - styled.TouchableOpacity → styled(SccTouchableOpacity)

### Phase 3: Styled Components - Core UI Components
**Files**: 6 files, 7 warnings
- `src/components/AppBar.style.ts` - styled.Pressable → styled(SccPressable)
- `src/components/StickyScrollNavigation.style.ts` - styled.Pressable → styled(SccPressable)
- `src/components/TakenPhotoItem.tsx` - Pressable import → SccPressable
- `src/components/StickyScrollNavigation.tsx` - TouchableOpacity import → SccTouchableOpacity
- `src/components/PressableChip/index.tsx` - Pressable import → SccPressable
- `src/components/PositionedModal.tsx` - TouchableWithoutFeedback → SccTouchableWithoutFeedback

### Phase 4: Screen Components - Camera & Recording
**Files**: 3 files, 8 warnings
- `src/screens/CameraScreen/CameraScreen.style.ts` - 5x styled.Pressable → styled(SccPressable)
- `src/screens/CameraScreen/CameraPreview.style.ts` - styled.Pressable → styled(SccPressable)
- `src/screens/CameraScreen/CameraDeviceSelect.style.ts` - styled.Pressable → styled(SccPressable)

### Phase 5: Map Components
**Files**: 2 files, 2 warnings
- `src/components/maps/ItemMapView.tsx` - 2x styled.TouchableOpacity → styled(SccTouchableOpacity)

### Phase 6: Modal Components
**Files**: 3 files, 4 warnings
- `src/modals/BottomSheet/BottomSheet.tsx` - TouchableOpacity import → SccTouchableOpacity
- `src/modals/BottomSheet/BottomSheetButtonGroup.tsx` - 2x styled.Pressable → styled(SccPressable)

### Phase 7: Challenge & Conqueror Screens
**Files**: 5 files, 6 warnings
- `src/screens/ChallengeDetailScreen/components/ChallengeDetailCompanyModal/CompanySelector.tsx` - 2x styled.TouchableOpacity
- `src/screens/ChallengeDetailScreen/components/ChallengeDetailCompanyModal/Input.tsx` - TouchableOpacity import
- `src/screens/ChallengeDetailScreen/components/ChallengeDetailCompanyModal/index.tsx` - TouchableOpacity import
- `src/screens/ConquererHistoryScreen/sections/ConqueredPlaceItem.tsx` - styled.Pressable
- `src/screens/ConquererMonthlyScreen/ConquererMonthlyScreen.style.ts` - styled.Pressable

### Phase 8: Home & Search Screens
**Files**: 8 files, ~15 warnings
- Home screen related components
- Search screen related components
- Place detail screen components

### Phase 9: Menu & User Screens
**Files**: 5 files, ~10 warnings
- Menu screen components
- User settings components
- Profile related screens

### Phase 10: Place Form Screens
**Files**: 8 files, ~12 warnings
- PlaceFormScreen components
- BuildingFormScreen components
- PlaceReviewFormScreen components

### Phase 11: Remaining Screens
**Files**: ~10 files, ~15 warnings
- All other screen components
- Miscellaneous components

### Phase 12: DevTool Components (Optional)
**Files**: 2 files, 3 warnings
- `src/components/DevTool/DevTool.tsx` - TouchableOpacity, TouchableWithoutFeedback imports
- `src/components/DevTool/EventLoggingBottomSheet.tsx` - TouchableOpacity import

**Note**: These might be intentionally excluded from logging

### Phase 13: Navigation Component
**Files**: 1 file, 1 warning
- `src/navigation/Navigation.tsx` - Pressable import → SccPressable

**Note**: May need careful testing as it affects app navigation

## Implementation Guidelines

### For `no-restricted-imports` warnings:
```typescript
// Before
import { TouchableOpacity } from 'react-native';

// After
import { SccTouchableOpacity } from '@/components/SccTouchableOpacity';
```

### For `no-restricted-syntax` warnings:
```typescript
// Before
const Button = styled.Pressable`...`;

// After
import { SccPressable } from '@/components/SccPressable';
const Button = styled(SccPressable)`...`;
```

### For Scc components themselves:
```typescript
// Add at the top of the file
/* eslint-disable no-restricted-imports */
import { Pressable } from 'react-native';
/* eslint-enable no-restricted-imports */
```

## Testing Strategy

### Per Phase Testing:
1. **Build Test**: `npm run build` - No TypeScript errors
2. **Lint Test**: `npm run lint` - Warnings should decrease
3. **Runtime Test**: Test affected screens/components
4. **Event Logging Test**: Verify both element_view and element_click events

### Critical Testing Areas:
- Navigation functionality (Phase 13)
- Form submissions (Phase 2)
- Camera functionality (Phase 4)
- Map interactions (Phase 5)
- Modal displays (Phase 6)

## Success Metrics

- [ ] All 92 ESLint warnings resolved
- [ ] No runtime errors introduced
- [ ] Event logging working for all converted components
- [ ] TypeScript compilation successful
- [ ] All tests passing

## Rollback Strategy

Each phase should be a separate commit for easy rollback:
```bash
git commit -m "ESLint migration: Phase X - [description]"
```

If issues arise:
```bash
git revert <commit-hash>
```

## Estimated Timeline

| Phase | Files | Warnings | Duration | Risk |
|-------|-------|----------|----------|------|
| 1 | 4 | 4 | 30 min | Low |
| 2 | 5 | 6 | 1 hour | Low |
| 3 | 6 | 7 | 1 hour | Low |
| 4 | 3 | 8 | 1 hour | Medium |
| 5 | 2 | 2 | 30 min | Low |
| 6 | 3 | 4 | 45 min | Medium |
| 7 | 5 | 6 | 1 hour | Low |
| 8 | 8 | 15 | 2 hours | Medium |
| 9 | 5 | 10 | 1.5 hours | Low |
| 10 | 8 | 12 | 2 hours | Medium |
| 11 | 10 | 15 | 2 hours | Low |
| 12 | 2 | 3 | 30 min | Low |
| 13 | 1 | 1 | 30 min | High |
| **Total** | **62** | **92** | **~14 hours** | |

## Notes

1. **DevTool components** (Phase 12) might be intentionally excluded from event logging
2. **Navigation component** (Phase 13) needs extra careful testing
3. **Import additions needed**: Most styled component files will need to import the Scc components
4. **elementName prop**: Each converted component needs an appropriate elementName for logging
5. **logParams prop**: Some components might need additional logging parameters