# LogClick to SccComponent Migration Plan

## Overview

This document outlines a phased approach to replace `LogClick` wrapper components with new `SccTouchableOpacity`, `SccPressable`, etc. components that provide automatic event logging without wrapper overhead.

## Current State Analysis

### LogClick Usage Patterns Found (27 files)

1. **Wrapper Pattern**: `<LogClick elementName="..."><TouchableOpacity/></LogClick>`
2. **With params**: `<LogClick elementName="..." params={{...}}>`
3. **Complex nested**: Components with multiple LogClick wrappers
4. **Core components**: SccButton uses LogClick internally

### Key Differences: LogClick vs SccComponents

| Aspect | LogClick | SccComponents |
|--------|----------|---------------|
| Structure | Wrapper component | Direct component replacement |
| Logging | Only on click | Both mount (element_view) + click (element_click) |
| Props | elementName, params | elementName, logParams |
| Implementation | cloneElement pattern | forwardRef with useEffect/onPress |

## Migration Strategy

### Phase 1: Safe Foundation Components (Low Risk)
**Target**: Standalone components with minimal dependencies
**Duration**: 1-2 days
**Files**: 8 files

#### Phase 1a: Atoms & Basic Components (4 files)
- `src/components/atoms/SccButton.tsx` ⭐ **HIGH PRIORITY**
- `src/modals/WithdrawConfirmBottomSheet/WithdrawConfirmBottomSheet.tsx`
- `src/screens/MenuScreen/components/MyProfileSection.tsx`
- `src/screens/MenuScreen/components/MenuListSection.tsx`

#### Phase 1b: Simple Screen Sections (4 files)
- `src/screens/HomeScreen/sections/BannerSection.tsx`
- `src/screens/PlaceDetailScreen/components/PlaceReviewSummaryInfo.tsx`
- `src/screens/PlaceDetailScreen/components/PlaceDetailImageList.tsx`
- `src/screens/PlaceDetailScreen/sections/PlaceDetailCoverImage.tsx`

**Testing Checklist**:
- [ ] Button interactions work correctly
- [ ] element_view logs on component mount
- [ ] element_click logs on user interaction
- [ ] No TypeScript errors
- [ ] No runtime crashes

### Phase 2: Form & Input Components (Medium Risk)
**Target**: Form sections and input-related components
**Duration**: 2-3 days
**Files**: 7 files

#### Phase 2a: Form Sections (4 files)
- `src/screens/PlaceFormScreen/sections/EnteranceSection.tsx`
- `src/screens/BuildingFormScreen/sections/EnteranceSection.tsx`
- `src/screens/PlaceReviewFormScreen/sections/IndoorInfoSection.tsx`
- `src/screens/PlaceReviewFormScreen/sections/ToiletSection.tsx`

#### Phase 2b: Detail & Summary Sections (3 files)
- `src/screens/PlaceDetailScreen/sections/PlaceDetailSummarySection.tsx`
- `src/screens/PlaceDetailScreen/sections/PlaceDetailRegisterIndoorSection.tsx`
- `src/screens/PlaceDetailScreen/sections/PlaceDetailToiletSection.tsx`

**Testing Checklist**:
- [ ] Form submissions work correctly
- [ ] Validation still functions
- [ ] Guide links work properly
- [ ] Modal interactions preserved

### Phase 3: Search & Navigation (High Risk)
**Target**: Search functionality and navigation components
**Duration**: 2-3 days
**Files**: 7 files

#### Phase 3a: Search Components (4 files)
- `src/screens/SearchScreen/components/SearchHeader/SearchCategory.tsx`
- `src/screens/SearchScreen/components/SearchHistories.tsx`
- `src/screens/SearchScreen/components/SearchItemCard.tsx`
- `src/screens/SearchScreen/components/SearchRecommendPlace.tsx`

#### Phase 3b: Navigation & Core Screens (3 files)
- `src/screens/HomeScreen/sections/SearchSection.tsx` ⚠️ **CRITICAL**
- `src/screens/HomeScreen/HomeScreen.tsx`
- `src/navigation/Navigation.tsx`

**Testing Checklist**:
- [ ] Search functionality intact
- [ ] Navigation routing works
- [ ] Map integration preserved
- [ ] Search categories functional

### Phase 4: Complex Integration & Clean-up (High Risk)
**Target**: Complex components and system files
**Duration**: 1-2 days
**Files**: 5 files

#### Phase 4a: Complex Components (2 files)
- `src/screens/PlaceDetailScreen/components/PlaceDetailCommentSection.tsx`
- `src/screens/PlacePhotoGuideScreen/PlacePhotoGuideScreen.tsx`

#### Phase 4b: System Clean-up (3 files)
- `src/logging/LogViewAndClick.tsx` - Update/deprecate
- `src/logging/LogClick.tsx` - Mark as deprecated
- `src/logging/Logger.ts` - Update if needed

**Testing Checklist**:
- [ ] All LogClick imports removed
- [ ] ESLint rules activated
- [ ] No unused imports
- [ ] Full app regression test

## Rollback Strategy

### Immediate Rollback (Per Phase)
If issues are found during any phase:

1. **Git Revert**: `git revert <commit-hash>` for the entire phase
2. **File-by-file Rollback**: Individual file restoration if needed
3. **Component Disable**: Temporarily disable ESLint rules if blocking

### Full Migration Rollback
If the entire migration needs to be reverted:

1. Remove all SccComponent files:
   ```bash
   rm src/components/SccTouchableOpacity.tsx
   rm src/components/SccPressable.tsx
   rm src/components/SccTouchableHighlight.tsx
   rm src/components/SccTouchableWithoutFeedback.tsx
   ```

2. Revert ESLint rules in `.eslintrc.js`
3. Restore original LogClick usage patterns
4. Test core functionality

## Migration Commands Per Phase

### Phase 1a Commands
```bash
# SccButton - Most critical
# Replace LogClick wrapper with SccTouchableOpacity
# Add elementName and logParams props
```

### Phase 2a Commands  
```bash
# Form sections
# Replace LogClick + TouchableOpacity with SccTouchableOpacity
# Replace LogClick + Pressable with SccPressable
# Maintain Guide component logging
```

### Phase 3a Commands
```bash
# Search components
# Careful with SearchCategory - complex state management
# Preserve search functionality and navigation
```

## Risk Assessment

### High Risk Components
1. `src/components/atoms/SccButton.tsx` - Used everywhere
2. `src/screens/HomeScreen/sections/SearchSection.tsx` - Core functionality
3. `src/screens/SearchScreen/components/SearchHeader/SearchCategory.tsx` - Complex state

### Medium Risk Components
4. Form sections - User input flows
5. Navigation components - App routing

### Low Risk Components
6. Simple display components
7. Modal and profile sections

## Testing Strategy

### Per-Phase Testing
1. **Unit Level**: Individual component mount and click behavior
2. **Integration Level**: Screen-level functionality preserved
3. **E2E Level**: User workflows still functional

### Full Migration Testing
1. **Smoke Test**: Critical paths work (search, navigation, forms)
2. **Regression Test**: All existing functionality preserved
3. **Logging Test**: Both element_view and element_click events firing
4. **Performance Test**: No significant performance degradation

## Success Criteria

### Technical Success
- [ ] All LogClick usage replaced with SccComponents
- [ ] Both element_view (mount) and element_click (interaction) logging works
- [ ] No TypeScript errors or runtime crashes
- [ ] ESLint rules enforcing new pattern active
- [ ] No unused LogClick imports remain

### Functional Success  
- [ ] All user workflows preserved
- [ ] Search functionality intact
- [ ] Form submissions work
- [ ] Navigation routing preserved
- [ ] Modal interactions functional

### Quality Success
- [ ] Code is cleaner (no wrapper components)
- [ ] More comprehensive logging (mount + click)
- [ ] Consistent component API across the app
- [ ] Better TypeScript type safety

## Estimated Timeline

| Phase | Duration | Risk Level | Dependencies |
|-------|----------|------------|--------------|
| Phase 1a | 1 day | Low | None |
| Phase 1b | 1 day | Low | None |  
| Phase 2a | 2 days | Medium | Phase 1 complete |
| Phase 2b | 1 day | Medium | Phase 2a complete |
| Phase 3a | 2 days | High | Phase 2 complete |
| Phase 3b | 2 days | High | Phase 3a complete |
| Phase 4a | 1 day | High | Phase 3 complete |
| Phase 4b | 1 day | Medium | All phases complete |
| **Total** | **11 days** | | |

## Notes

- Each phase should be committed separately for easy rollback
- Run comprehensive tests after each phase
- Monitor logging output to ensure both event types are firing
- Keep LogClick.tsx file until migration is 100% complete
- Consider feature flags for gradual rollout if needed