# 앱 배포 가이드

이 문서는 scc-app의 배포 절차를 설명하며, OTA(Over-the-Air) 업데이트와 네이티브 바이너리 배포 방법을 모두 다룹니다.

## 1. OTA (Over-the-Air) 배포

OTA 업데이트는 사용자가 앱 스토어에서 새 버전을 다운로드하지 않아도 자바스크립트 번들 및 에셋 변경 사항을 앱에 푸시하는 방식입니다. 이 프로젝트에서는 `hot-updater`를 사용하며, 번들과 업데이트 메타데이터 저장은 AWS S3를 이용합니다.

배포 프로세스는 GitHub Actions를 통해 자동화되어 있습니다.

### 환경

- **Sandbox**: 개발 및 QA 환경.
- **Production**: 실제 사용자를 위한 라이브 환경.

### Sandbox 환경 배포

- **트리거**: `main` 또는 `release-[version]` 브랜치에 코드가 푸시될 때마다 자동으로 실행됩니다.
- **워크플로우**: `.github/workflows/cd-sandbox.yml`
- **프로세스**:
  1. 워크플로우가 코드를 체크아웃합니다.
  2. `yarn ota-deploy:sandbox` 명령어를 실행합니다.
  3. 이 명령어는 `subprojects/scc-frontend-build-configurations/sandbox/.env.hot-updater` 설정 파일을 사용하여 `hot-updater deploy`를 실행합니다.
  4. 새 번들이 빌드되어 샌드박스용 S3 버킷에 업로드됩니다.
  5. 성공 또는 실패 시 Slack으로 알림이 전송됩니다.

### Production 환경 배포

- **트리거**: `vX.Y.Z` (예: `v1.2.3`) 형식의 Git 태그를 푸시하면 실행됩니다.
  - **중요**: `-android` 또는 `-ios`로 끝나는 태그는 OTA 배포를 트리거하지 않습니다.
- **워크플로우**: `.github/workflows/cd-production.yml`
- **프로세스**:
  1. 워크플로우가 해당 태그의 코드를 체크아웃합니다.
  2. `yarn ota-deploy:production` 명령어를 실행합니다.
  3. 이 명령어는 `subprojects/scc-frontend-build-configurations/production/.env.hot-updater` 설정 파일을 사용하여 `hot-updater deploy`를 실행합니다.
  4. 새 번들이 빌드되어 프로덕션용 S3 버킷에 업로드됩니다.
  5. 성공 또는 실패 시 Slack으로 알림이 전송됩니다.

---

## 2. 네이티브 바이너리 배포

네이티브 바이너리 배포는 네이티브 코드(iOS/Android) 변경, 의존성 업데이트, 또는 앱 스토어에 새로운 앱 버전 등록이 필요할 때 수행합니다. 이 과정은 **로컬에서의 준비**와 **CI/CD를 통한 자동화** 두 단계로 나뉩니다.

### 로컬에서의 릴리즈 준비

로컬 환경에서는 `fastlane`을 사용하여 릴리즈를 준비합니다. 이 단계는 **버전 번호를 올리고, 변경사항을 커밋한 후, 원격 저장소에 태그를 푸시**하는 역할만 합니다.

1.  각 플랫폼 디렉토리로 이동합니다 (`cd android` 또는 `cd ios`).
2.  `bundle install`을 실행하여 의존성을 설치합니다.
3.  `bundle exec fastlane [android|ios] prepare_release`를 실행합니다.
4.  프롬프트에 따라 새 버전 번호를 입력합니다.
5.  Fastlane 스크립트가 다음 작업을 자동으로 처리합니다.
    - `version.properties`(Android) 또는 `Info.plist`(iOS) 파일의 버전 번호 업데이트
    - 변경사항을 커밋 (`Release [android|ios] X.Y.Z`)
    - `vX.Y.Z-[android|ios]` 형식의 태그 생성
    - 원격 저장소로 커밋과 태그를 푸시

### CI/CD를 통한 빌드 및 배포

로컬에서 푸시된 태그는 GitHub Actions 워크플로우를 트리거하여 실제 빌드와 배포를 수행합니다.

- **트리거**:
  - **Android**: `vX.Y.Z-android` 형식의 Git 태그가 푸시될 때.
  - **iOS**: `vX.Y.Z-ios` 형식의 Git 태그가 푸시될 때.
- **워크플로우**: `.github/workflows/cd-native-build.yml`
- **프로세스**:
  1.  **태그 감지**: CI가 원격 저장소에 푸시된 새 태그를 감지하고 워크플로우를 시작합니다.
  2.  **Fastlane 실행**: CI 환경에서 `bundle exec fastlane [android|ios] release_candidate` 명령어를 실행합니다. 이 lane은 이제 빌드와 배포만 담당합니다.
  3.  **빌드 및 배포**:
      - **Android**: AAB(Production) 또는 APK(Sandbox)를 빌드하여 **Firebase App Distribution**에 업로드합니다.
      - **iOS**: `.ipa` 파일을 빌드하여 **Firebase App Distribution**과 **TestFlight**에 업로드합니다.
  4.  **알림**: 완료 시 Slack으로 결과가 통보됩니다.
