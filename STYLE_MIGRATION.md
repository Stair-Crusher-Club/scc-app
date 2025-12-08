# Styled-Components to NativeWind Migration Status

## Overview

이 문서는 프로젝트의 styled-components를 NativeWind로 마이그레이션하는 작업의 진행 상황을 추적합니다.

## 완료된 화면 ✅

1. **ConquererHistoryScreen** - 정복 히스토리 화면
   - `ConquererHistoryScreen.tsx` ✅
   - `sections/ConqueredPlaceItem.tsx` ✅
   - `sections/AchievementsSection.tsx` ✅
   - ~~`sections/AchievementsSection.style.ts`~~ (삭제됨)

2. **ConquererUpVoteScreen** - 정복 추천 화면 (완료)
   - `index.tsx` ✅
   - `components/UpvotedPlaceItem.tsx` ✅

3. **ReviewHistoryScreen** - 리뷰 히스토리 화면 (완료)
   - `index.tsx` ✅
   - `components/PlaceReviewItem.tsx` ✅
   - `components/PlaceToiletReviewItem.tsx` ✅

4. **ReviewScreen** - 리뷰 화면 (완료)
   - `index.tsx` ✅
   - `sections/SummarySection.tsx` ✅
   - `sections/HistorySection.tsx` ✅

5. **ReviewUpVoteScreen** - 리뷰 추천 화면 (완료)
   - `index.tsx` ✅
   - `components/ReviewUpvoteItem.tsx` ✅

6. **ConquererScreen** - 정복 화면 (부분 완료)
   - `sections/ConquererSummarySection.tsx` ✅
   - `sections/CrusherHistorySection.tsx` ✅
   - ⚠️ `ConquererScreen.style.tsx` (남음)
   - ⚠️ `MyConqueredPlaceItem.style.ts` (남음)
   - ⚠️ `sections/WeeklyConquererSection.style.ts` (남음)

7. **LoginScreen** - 로그인 화면 (완료)
   - `LoginScreen.tsx` ✅ (전체 NativeWind 변환 완료)

8. **SettingScreen** - 설정 화면 (완료)
   - `SettingScreen.tsx` ✅
   - `components/BottomButtons.tsx` ✅
   - `components/VersionRow.tsx` ✅

9. **TabBar** - 공통 탭바 컴포넌트 (완료)
   - `src/components/TabBar.tsx` ✅

10. **UpvoteAnalyticsScreen** - 추천 통계 화면 (완료)

- `index.tsx` ✅

11. **ChallengeScreen** - 챌린지 화면 (완료)

- `ChallengeScreen.tsx` ✅
- ~~`ChallengeScreen.style.ts`~~ (삭제됨)

12. **MenuScreen** - 메뉴 화면 (완료)

- `components/MenuListSection.tsx` ✅
- `components/MyProfileSection.tsx` ✅
- `MenuScreen.tsx` ✅ (Divider 인라인 처리)
- ~~`components/MenuListSection.style.ts`~~ (삭제됨)
- ~~`components/MyProfileSection.style.ts`~~ (삭제됨)
- ~~`components/Divider.tsx`~~ (삭제됨, 인라인으로 처리)

13. **PlaceFormV2Screen** - 장소 폼 V2 (완료)

- `PlaceFormV2Screen.tsx` ✅ (공통 컴포넌트들 NativeWind 변환 + cn 적용)
- `components/TextAreaV2.tsx` ✅ (cn 적용)
- `components/OptionsV2.tsx` ✅ (cn 적용)
- `components/OptionsChip.tsx` ✅ (NativeWind 완전 마이그레이션 + cn 적용)
- `components/PhotosV2.tsx` ✅
- `components/FloorStep.tsx` ✅
- `components/GuideModal.tsx` ✅
- `components/InfoStep.tsx` ✅
- `components/FloorMovementStep.tsx` ✅
- `components/FormQuestion.tsx` ✅ (신규 공통 컴포넌트)
- `components/FormStyles.tsx` ✅ (신규 공통 스타일 컴포넌트)
- `components/GuideLink.tsx` ✅ (신규 공통 컴포넌트)
- `components/MeasureGuide.tsx` ✅ (신규 공통 컴포넌트)
- ~~`components/TextAreaV2.style.ts`~~ (삭제됨)
- ~~`components/OptionsV2.style.ts`~~ (삭제됨)
- ~~`components/PhotosV2.style.ts`~~ (삭제됨)

14. **BuildingFormV2Screen** - 건물 폼 V2 (완료)

- `BuildingFormV2Screen.tsx` ✅ (NativeWind 완전 마이그레이션)
- PlaceFormV2Screen의 공통 컴포넌트 재사용
- ~~`BuildingFormV2Screen.style.ts`~~ (삭제됨)

15. **HomeScreen** - 홈 화면 (완료)

- `HomeScreen.tsx` ✅ (NativeWind 마이그레이션)
- `components/CoachMarkBanner.tsx` ✅
- `components/CoachMarkGuideLink.tsx` ✅
- `components/CoachMarkMapButton.tsx` ✅
- `components/CoachMarkOverlay.tsx` ✅
- `components/Tooltip.tsx` ✅
- `sections/BannerSection.tsx` ✅
- `sections/ChallengeSection.tsx` ✅
- `sections/SearchSection.tsx` ✅
- ~~`HomeScreen.style.ts`~~ (삭제됨)
- ~~`components/CoachMark.style.ts`~~ (삭제됨)
- ~~`sections/ChallengeSection.style.ts`~~ (삭제됨)

---

## 마이그레이션 대기 중인 화면 (22개) 🔄

### 1. BuildingFormScreen

- `BuildingFormScreen.style.ts`
- `sections/ElevatorSection.style.ts`
- `sections/EnteranceSection.style.ts`
- `sections/HeaderSection.style.ts`
- `sections/StickyScrollNavigation.style.ts`

### 2. CameraScreen

- `CameraDeviceSelect.style.ts`
- `CameraNotAuthorized.style.ts`
- `CameraPreview.style.ts`
- `CameraScreen.style.ts`

### 3. ChallengeDetailScreen (대형 화면)

**메인 파일:**

- `ChallengeDetailScreen.style.ts`
- `ChallengeDetailScreen.tsx`

**컴포넌트:**

- `components/ChallengeDetailClosedStatus.tsx`
- `components/ChallengeDetailCompanyModal/index.tsx`
- `components/ChallengeDetailCompanyModal/Input.tsx`
- `components/ChallengeDetailInProgressStatus/ChallengeDetailInProgressStatus.style.ts`
- `components/ChallengeDetailInProgressStatus/ContributionMilestone.tsx`
- `components/ChallengeDetailInProgressStatus/ContributionsBubble.tsx`
- `components/ChallengeDetailInProgressStatus/CurrentStepImage.tsx`
- `components/ChallengeDetailInProgressStatus/MilestoneSuccess.tsx`
- `components/ChallengeDetailInProgressStatus/ProgressBar.tsx`
- `components/ChallengeDetailMetrics.tsx`
- `components/ChallengeDetailMetricsContributionRow.tsx`
- `components/ChallengeDetailMetricsRow.tsx`
- `components/ChallengeDetailPasscodeBottomSheet.tsx`
- `components/ChallengeDetailQuestSection/CurvedDateText.tsx`
- `components/ChallengeDetailQuestSection/index.tsx`
- `components/ChallengeDetailQuestSection/QuestItem.tsx`
- `components/ChallengeDetailRankSection/ChallengeDetailRankSection.tsx`
- `components/ChallengeDetailRankSection/LastMonthRankingSection.tsx`
- `components/ChallengeDetailRankSection/MyRank.tsx`
- `components/ChallengeDetailRankSection/TopTenRank.tsx`
- `components/ChallengeDetailStickyActionBar.tsx`
- `components/ChallengeWelcomeModal.tsx`
- `components/LastMonthRankingModal.tsx`

### 4. ConquererMonthlyScreen

- `ConquererMonthlyScreen.style.ts`
- `sections/ConqueredList.style.ts`

### 5. ConquererScreen (일부 남음)

- `ConquererScreen.style.tsx`
- `MyConqueredPlaceItem.style.ts`
- `sections/WeeklyConquererSection.style.ts`

### 6. CrusherActivity

- `components/ClubQuestCheckInCompleteModal.tsx`
- `components/HistoryItem.tsx`
- `components/WelcomeAnimation.tsx`
- `components/WelcomeModal.tsx`

### 7. ExternalAccessibilityDetailScreen

- `AvailableLabel.tsx`
- `index.tsx`

### 8. FavoritePlacesScreen

- `components/FavoriteListView.tsx`
- `components/FavoriteNoResult.tsx`

### 9. GuideForFirstVisitScreen

- `GuideForFirstVisitScreen.style.ts`
- `GuideItem.style.ts`

### 10. PlaceDetailScreen (대형 화면)

**메인 파일:**

- `PlaceDetailScreen.style.ts`

**컴포넌트:**

- `components/NewPlaceInfo.style.tsx`
- `components/PlaceDetailImageList.tsx`
- `components/PlaceInfo.style.ts`
- `components/PlaceReviewSummaryInfo.tsx`
- `components/PlaceVisitReviewInfo.tsx`
- `components/UserMobilityLabel.tsx`

**모달:**

- `modals/PlaceDetailNegativeFeedbackBottomSheet.tsx`
- `modals/PlaceVisitReviewFilterModal.tsx`
- `modals/RegisterCompleteBottomSheet.tsx`
- `modals/RequireBuildingAccessibilityBottomSheet.tsx`

**섹션:**

- `sections/PlaceDetailAppBar.style.ts`
- `sections/PlaceDetailBuildingSection.tsx`
- `sections/PlaceDetailCoverImage.style.ts`
- `sections/PlaceDetailCrusher.tsx`
- `sections/PlaceDetailEntranceSection.style.ts`
- `sections/PlaceDetailEntranceSection.tsx`
- `sections/PlaceDetailFeedbackSection.style.ts`
- `sections/PlaceDetailIndoorSection.tsx`
- `sections/PlaceDetailNoBuildingSection.style.ts`
- `sections/PlaceDetailSummarySection.style.ts`
- `sections/PlaceDetailSummarySection.tsx`
- `sections/PlaceDetailToiletSection.tsx`

### 11. PlaceDetailV2Screen

- `modals/BuildingRegistrationBottomSheet.tsx`

### 12. PlaceFormScreen

- `PlaceFormScreen.style.ts`
- `sections/CommentsSection.style.ts`
- `sections/EnteranceSection.style.ts`
- `sections/FloorSection.style.ts`
- `sections/HeaderSection.style.ts`

### 13. PlacePhotoGuideScreen

- `PlacePhotoGuideScreen.style.ts`

### 14. PlaceReviewFormScreen

- `components/Question.tsx`
- `sections/common.style.ts`
- `sections/PlaceInfoSection.tsx`
- `views/IndoorReviewView.tsx`
- `views/ToiletReviewView.tsx`

### 15. ProfileEditorScreen

- `ProfileEditorDetailScreen.tsx`
- `ProfileEditorScreen.tsx`

### 16. RegistrationCompleteScreen

- `RegistrationCompleteScreen.tsx`

### 17. SearchScreen (대형 화면)

**메인 파일:**

- `SearchScreen.style.ts`

**컴포넌트:**

- `components/LGButton.tsx`sa
- `components/QuestClearStamp.tsx`
- `components/QuestCompletionModal.tsx`
- `components/ReviewLabel.tsx`
- `components/ScoreLabel.tsx`
- `components/SearchExplore.tsx`
- `components/SearchHeader/index.tsx`
- `components/SearchHeader/SearchCategory.tsx`
- `components/SearchHeader/SearchCategoryIcon.web.tsx`
- `components/SearchHeader/SearchFilterPreview.tsx`
- `components/SearchHeader/SearchInputText.tsx`
- `components/SearchHistories.tsx`
- `components/SearchItemCard.tsx`
- `components/SearchItemCard.web.tsx`
- `components/SearchItemSummary.tsx`
- `components/SearchListView.tsx`
- `components/SearchLoading.tsx`
- `components/SearchLoading.web.tsx`
- `components/SearchMapView.tsx`
- `components/SearchNoResult.tsx`
- `components/SearchRecommendKeyword.tsx`
- `components/SearchRecommendPlace.tsx`
- `components/SearchSummaryView.tsx`
- `components/Tooltip.tsx`
- `components/XSButton.tsx`

**모달:**

- `modals/ChipSelector.tsx`
- `modals/FilterModal.tsx`
- `modals/ScoreSelector.tsx`
- `modals/SearchSortOptionSelectorBottomSheet.tsx`
- `modals/SearchSortOptionSelectorItem.tsx`

### 18. SignupScreen

- `SignupFirstPage.tsx`
- `SignupSecondPage.tsx`
- `components/AskBottomSheet.tsx`
- `components/BirthYearSelector.tsx`
- `components/ProgressViewer.tsx`
- `components/SelectableItem.tsx`
- `components/SignupInput.tsx`

### 19. ToiletMapScreen

- `index.tsx`
- `ToiletCard.tsx`

---

## 통계

- ✅ **완료**: 15개 화면 (LoginScreen, SettingScreen, ReviewHistoryScreen, ReviewUpVoteScreen, ReviewScreen, ConquererUpVoteScreen, ConquererHistoryScreen, TabBar, UpvoteAnalyticsScreen, ChallengeScreen, MenuScreen, PlaceFormV2Screen, BuildingFormV2Screen, HomeScreen)
- 🔶 **부분 완료**: 1개 화면 (ConquererScreen)
- 🔄 **대기**: 22개 화면
- 📊 **전체**: 38개 화면/컴포넌트
- 🎯 **진행률**: ~39.5% (완료) + 2.6% (부분) = **42.1%**

---

## 마이그레이션 가이드

### NativeWind 사용 규칙

1. **className 사용**: 레이아웃, spacing, colors, fonts는 className으로
2. **정확한 px 단위**: `p-[20px]`, `gap-[4px]` 형식으로 정확한 픽셀 사용
3. **font family 명시**: `font-pretendard-regular`, `font-pretendard-bold` 등 명시적으로 사용
4. **color 사용**: `text-gray-90`, `bg-brand-50` 등 tailwind.config.js에 정의된 컬러 사용
5. **fontSize/lineHeight**: className으로 처리 (예: `text-[16px] leading-[24px]`)
6. margin 보다는 gap 사용하기
7. **SVG 색상**: `src/constant/colors.ts`에서 import하여 사용 (`colors.gray[90]`, `colors.brand[50]` 등)
8. **조건부 스타일**: `cn` 유틸리티 사용 (삼항 연산자, 논리 연산자 등)

### NativeWind vs 웹 Tailwind 차이점

NativeWind는 웹 Tailwind CSS와 다르게 동작합니다. 다음 기능들은 React Native에서 지원하지 않습니다:

- **CSS 가상 선택자**: `:hover`, `:focus`, `:active` 등 → JavaScript로 상태 관리 + props 전달
- **box-shadow**: `shadow-lg` 등 → React Native의 `shadowColor`, `shadowOffset`, `elevation` 사용
- **CSS transforms/transitions**: `transition-all`, `duration-300` 등 → `react-native-reanimated` 사용
- **backdrop-filter**: `backdrop-blur` 등 → 지원 안 됨

자세한 내용은 공식문서를 참고해주세요: https://www.nativewind.dev/docs

### cn 유틸리티 사용 (조건부 스타일링)

**중요**: className과 style을 동시에 사용하면서 style에서 조건 분기하는 경우, `cn` 유틸리티를 사용하세요!

#### cn이 필요한 경우

1. **선택/포커스 상태에 따른 색상 변경**
2. **삼항 연산자로 className 분기**
3. **여러 조건을 조합하여 스타일 적용**

#### 사용 예시

```ts
import {cn} from '@/utils/cn';

// ❌ Bad: style에서 조건 분기
const borderColor = selected ? colors.blue[40] : colors.gray[20];
<View className="..." style={{borderColor}}>

// ✅ Good: cn으로 조건부 className
<View className={cn(
  '...',
  selected ? 'border-blue-40' : 'border-gray-20'
)}>

// ❌ Bad: 여러 변수로 조건 분기
const borderColor = selected ? colors.blue[40] : colors.gray[20];
const backgroundColor = selected ? colors.brand[5] : colors.white;
<SccPressable style={{borderColor, backgroundColor}}>

// ✅ Good: cn으로 한번에 처리
<SccPressable className={cn(
  'base-classes',
  selected ? 'border-blue-40 bg-brand-5' : 'border-gray-20 bg-white',
  disabled && 'opacity-30'
)}>

// ❌ Bad: 포커스 상태를 style로 처리
const borderColor = isFocused ? colors.brand[50] : colors.gray[20];
<TextInput style={{borderWidth: 1, borderColor}} />

// ✅ Good: props로 상태를 받아 cn으로 처리
interface InputProps {
  isFocused: boolean;
}

function CustomInput({ isFocused }: InputProps) {
  return (
    <TextInput
      className={cn(
        'border',
        isFocused ? 'border-brand-50' : 'border-gray-20'
      )}
    />
  );
}
```

#### cn 패턴

```tsx
// 패턴 1: 단일 조건 분기
className={cn(
  'base-classes',
  condition ? 'true-classes' : 'false-classes'
)}

// 패턴 2: 여러 조건 독립적으로
className={cn(
  'base-classes',
  condition1 && 'conditional-class-1',
  condition2 && 'conditional-class-2',
  condition3 ? 'class-a' : 'class-b'
)}

// 패턴 3: 복잡한 조건은 변수로 분리
const variantClasses = {
  selected: 'border-blue-40 bg-brand-5 text-brand-50',
  default: 'border-gray-20 bg-white text-gray-80',
};
className={cn(
  'base-classes',
  selected ? variantClasses.selected : variantClasses.default,
  disabled && 'opacity-30'
)}
```

자세한 내용은 `style_cn.md` 문서를 참고하세요.

---

### tailwind.config.js 참고

마이그레이션 시 `tailwind.config.js`에 정의된 컬러와 폰트를 활용하세요.

#### 사용 가능한 컬러

**Brand Colors:**

- `brand-5`, `brand-10`, `brand-15`, `brand-20`, `brand-25`, `brand-30`
- `brand-40`, `brand-50`, `brand-60`, `brand-70`

**Blue Colors:**

- `blue-1`, `blue-5`, `blue-10`, `blue-20`, `blue-30`, `blue-30a15`
- `blue-40`, `blue-50`, `blue-60`

**Gray Scale:**

- `gray-10`, `gray-15`, `gray-20`, `gray-25`, `gray-30`, `gray-40`, `gray-45`
- `gray-50`, `gray-60`, `gray-70`, `gray-80`, `gray-90`, `gray-100`

**Black with Alpha:**

- `blacka10`, `blacka20`, `blacka30`, `blacka40`, `blacka50`
- `blacka60`, `blacka70`, `blacka80`, `blacka90`

**Orange Colors:**

- `orange` (또는 `orange-DEFAULT`), `orange-10`, `orange-20`, `orange-30`, `orange-40`
- `light-orange`

**Yellow Colors:**

- `yellow` (또는 `yellow-DEFAULT`), `yellow-70`

**Success Colors:**

- `success` (또는 `success-DEFAULT`), `success-10`, `success-30`

**Utility Colors:**

- `white`, `black`, `red`, `link`

#### 사용 가능한 폰트

**Pretendard Font Family (weight별):**

- `font-pretendard-extralight` (100)
- `font-pretendard-thin` (200)
- `font-pretendard-light` (300)
- `font-pretendard-regular` (400) ⭐ 기본
- `font-pretendard-medium` (500)
- `font-pretendard-semibold` (600)
- `font-pretendard-bold` (700)
- `font-pretendard-extrabold` (800)

**GumiRomance Font:**

- `font-gumi-romance`

**⚠️ 중요:** `font-pretendard`만 사용하지 말고, 반드시 `-regular`, `-bold` 등을 명시하세요!

#### 컬러 매핑 예시

```tsx
// styled-components의 color constant를 NativeWind className으로 변환
${color.gray90}  → className="text-gray-90"  // 텍스트
${color.gray20}  → className="bg-gray-20"    // 배경
${color.gray20}  → className="border-gray-20" // 테두리
${color.brand50} → className="text-brand-50"

// font constant를 NativeWind className으로 변환
${font.pretendardRegular} → className="font-pretendard-regular"
${font.pretendardBold}    → className="font-pretendard-bold"
${font.pretendardMedium}  → className="font-pretendard-medium"
${font.pretendardSemiBold}→ className="font-pretendard-semibold"
```

#### SVG 색상 사용

SVG 컴포넌트에서 색상을 사용할 때는 `src/constant/tailwindColor.ts`에서 `tailwindColor` 객체를 import하여 사용하세요:

```tsx
import {tailwindColor} from '@/constant/tailwindColor';

// SVG fill/stroke 색상
<Svg>
  <Path fill={tailwindColor.gray[90]} />
  <Circle stroke={tailwindColor.brand[50]} />
  <Rect fill={tailwindColor.blue[30]} />
</Svg>;

// 중첩된 객체 접근 방식 사용
tailwindColor.gray[90]; // #141418
tailwindColor.brand[50]; // #0E64D3
tailwindColor.blue[30]; // #67AEFF
tailwindColor.orange[40]; // #F67600
tailwindColor.success[10]; // #E1FCF2
tailwindColor.blacka[50]; // #00000080

// 단일 색상
tailwindColor.white; // #fff
tailwindColor.black; // #000
tailwindColor.red; // #DB0B24
```

**⚠️ 주의사항:**

- SVG에서는 className의 색상 클래스가 작동하지 않으므로 반드시 `tailwindColor` 객체를 사용해야 합니다
- `tailwindColor.gray.90`이 아닌 `tailwindColor.gray[90]` 형식으로 접근하세요 (TypeScript 타입 안정성)
- `tailwindColor.orange.DEFAULT` 대신 단순히 `tailwindColor.orange`를 사용할 수 있습니다

### 예시

```tsx
// Before (styled-components)
const Container = styled.View`
  padding: 20px;
  background-color: ${color.white};
`;

const Title = styled.Text`
  font-size: 16px;
  font-family: ${font.pretendardBold};
  color: ${color.black};
  margin-bottom: 4px;
`;

// After (NativeWind)
<View className="p-[20px] bg-white">
  <Text className="font-pretendard-bold text-black mb-[4px] text-[16px]">
    Title
  </Text>
</View>;
```

```tsx
// Before (styled-components with brand color)
const Button = styled(SccPressable)`
  background-color: ${color.brand50};
  border: 2px solid ${color.brand60};
  padding: 12px 20px;
`;

const ButtonText = styled.Text`
  font-family: ${font.pretendardSemiBold};
  color: ${color.white};
  font-size: 14px;
`;

// After (NativeWind)
<SccPressable
  className="bg-brand-50 border-2 border-brand-60 px-[20px] py-[12px]"
  elementName="submit_button">
  <Text className="font-pretendard-semibold text-white text-[14px]">
    제출하기
  </Text>
</SccPressable>;
```
