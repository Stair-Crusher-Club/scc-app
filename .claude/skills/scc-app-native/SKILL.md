---
name: scc-app-native
description: SCC 앱 작업 후 검증 절차 + 네이티브(iOS/Android) 코드 규칙. 코드 변경 후 lint/tsc 검증, ios/android 디렉토리 변경 시 Release 빌드 검증, 네이티브 모듈(RCTBridgeModule/ReactContextBaseJavaModule) 작성 규칙을 다룬다. "네이티브 모듈 추가", "iOS 빌드 깨져", "release 빌드 검증", "브릿지 메서드", "CI에서만 빌드 실패", "Bridgeless" 같은 작업/증상 시, 그리고 scc-app 코드 변경을 마무리할 때 사용.
---

# SCC App — 검증 절차 + 네이티브 코드 규칙

## Required Post-Work Validation

코드 변경/구현 작업 후 **항상** 아래 검증을 실행하고 모든 문제를 수정한다:

1. **ESLint**: `yarn lint` — 0 warnings/errors가 될 때까지 반복 수정
2. **TypeScript**: `yarn tsc --noEmit` — 0 type errors가 될 때까지 반복 수정

**두 명령이 모두 깨끗하게 통과하기 전에는 작업 완료가 아니다.**

## 네이티브 코드 변경 시 추가 검증 (MANDATORY)

`ios/**/*.{mm,h,m,swift}`, `ios/**/project.pbxproj`, `android/**/*.{kt,java}` 중 어느 하나라도 변경됐다면 push 전에 **release configuration으로 compile-only 빌드**를 반드시 통과시킨다. JS lint/tsc는 네이티브 컴파일 에러를 잡지 못한다.

### 왜 필요한가

- Debug 빌드는 컴파일러 플래그가 느슨해서 `typeof` 같은 GCC 확장, 일부 deprecated API 호출 등이 경고로 다운그레이드되거나 통과됨
- CI는 ReleaseSandbox(App Store 배포용)로 `-Werror` 동급의 strict flag로 빌드 → 같은 코드가 거기서 깨짐
- Framework 링크 누락(예: `Undefined symbols for architecture arm64`) 같은 링커 에러도 Release 빌드에서야 노출됨

### iOS 검증 명령

```bash
xcodebuild -workspace ios/sccReactNative.xcworkspace \
  -configuration ReleaseSandbox \
  -scheme StairCrusherClubSandbox \
  -destination 'generic/platform=iOS' \
  CODE_SIGNING_ALLOWED=NO \
  build
```

- `CODE_SIGNING_ALLOWED=NO`: match AppStore 프로필 없이 컴파일/링크만 수행
- `generic/platform=iOS`: 특정 디바이스/시뮬레이터 안 잡고 빌드
- 첫 빌드 10~15분, 이후 incremental 1~2분

### Android 검증 명령

```bash
cd android && ./gradlew assembleSandboxRelease
```

### DerivedData 디스크 부족 시

`~/Library/Developer/Xcode/DerivedData/`가 수십GB까지 자라면 `rm -rf ~/Library/Developer/Xcode/DerivedData/*`로 비운다. 다음 빌드만 풀로 컴파일해서 한 번 느려질 뿐 안전하다.

## 네이티브 모듈 작성 규칙 (RCTBridgeModule / ReactContextBaseJavaModule)

새로운 네이티브 모듈을 만들거나 기존 모듈에 메서드를 추가할 때:

### 양쪽 플랫폼 메서드 시그니처 일치 필수

JS 측 wrapper의 반환 타입(`Promise<T>` vs `void`)이 iOS와 Android 양쪽의 native 메서드와 모두 일치해야 한다. 한쪽만 어긋나면 그 플랫폼에서 `TypeError: Cannot read properties of undefined` 같은 런타임 크래시가 발생한다.

| JS wrapper 반환 | iOS (.mm) | Android (.kt) |
|--------------|-----------|---------------|
| `Promise<T>` | `RCT_EXPORT_METHOD(name:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)` | `@ReactMethod fun name(promise: Promise)` |
| `void` | `RCT_EXPORT_METHOD(name)` | `@ReactMethod fun name()` |

### Bridgeless(New Architecture) 주의사항

이 프로젝트는 `isNewArchEnabled = true` + `bridgelessEnabled = YES`로 동작한다. `MainActivity`에서 `reactInstanceManager` 직접 접근은 throw를 일으킨다. 대신:

```kotlin
val reactContext = (application as? ReactApplication)?.reactHost?.currentReactContext
val module = reactContext?.getNativeModule(MyModule::class.java)
```

그리고 module lookup이 어떤 이유로 실패해도 시스템 기본 동작이 막히지 않도록 `try/catch`로 감싼다 (예: `dispatchKeyEvent` 오버라이드).

### NativeEventEmitter 이벤트 모듈

이벤트를 emit하는 모듈(`RCTEventEmitter` / `DeviceEventManagerModule`)은 RN의 EventEmitter 계약 상 `addListener(eventName: String)`, `removeListeners(count: Int)` 메서드를 노출해야 한다. Android 쪽은 명시적으로 `@ReactMethod`로 두 메서드를 선언해두자 (no-op이어도 됨).

## 관련 skill

- 로컬 환경/에뮬레이터 실행: `/scc-local-env`
- 에뮬레이터 E2E 테스트: `android-e2e-test.md` (scc-app/.claude/skills/)
- OTA/웹 배포: `/scc-app-release`
