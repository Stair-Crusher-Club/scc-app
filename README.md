# 계단뿌셔클럽 (SCC) 앱

계단뿌셔클럽은 이동 약자를 위한 접근성 정보 등록/공유 플랫폼입니다. 사용자들이 직접 건물과 장소의 접근성 정보를 등록하고 공유할 수 있습니다.

## 주요 기능

- 건물/장소의 접근성 정보 등록 및 조회
- 접근성 정보 기반 장소 검색
- 접근성 정보 공유 챌린지 참여
- 실시간 접근성 정보 업데이트

## 시작하기

### 필수 요구사항

- [React Native 개발 환경](https://reactnative.dev/docs/environment-setup#installing-dependencies)
- [Cocoapods](https://cocoapods.org/): iOS 라이브러리 관리
- [ios-deploy](https://github.com/ios-control/ios-deploy): (선택사항) CLI를 통한 iOS 앱 설치/실행용
- [Yarn](https://yarnpkg.com/): 패키지 관리자

### 설치 방법

1. 저장소 클론
```sh
git clone https://github.com/Stair-Crusher-Club/scc-app.git
cd scc-app
```

2. 서브모듈 초기화
```sh
git submodule init
git submodule update
```

3. 의존성 설치
```sh
yarn install
cd ios && pod install && cd ..
```

4. API 코드 생성
```sh
yarn codegen
```
이 명령어는 `subprojects/scc-api/api-spec.yaml` OpenAPI 명세를 기반으로 TypeScript API 클라이언트 코드를 생성합니다. API 명세가 변경될 때마다 실행해주세요.

5. Firebase 설정 파일 복사
```sh
# 운영 환경 빌드
cp subprojects/scc-frontend-build-configurations/production/google-services.json android/app/src/production/

# 개발 환경 빌드
cp subprojects/scc-frontend-build-configurations/sandbox/google-services.json android/app/src/sandbox/
```
이 단계는 Android 앱 빌드 전에 필수적으로 수행해야 합니다. Firebase 설정 파일은 빌드 환경별로 다르며, 빌드 프로세스 시작 전에 해당 위치에 있어야 합니다.

6. 개발 서버 실행
```sh
yarn start
```

7. 앱 실행
```sh
# iOS
yarn ios

# Android
yarn android
```

## 배포

### 자동 배포 (GitHub Actions)

프로젝트는 GitHub Actions를 통해 자동으로 OTA 업데이트를 배포합니다:

1. **개발 환경 배포**
- `main` 브랜치에 푸시하면 자동으로 개발 환경에 배포됩니다.

2. **운영 환경 배포**
- 새로운 버전 태그를 푸시하면 자동으로 운영 환경에 배포됩니다.
```sh
git tag v1.0.0
git push origin v1.0.0
```

### 수동 OTA 업데이트

[hot-updater](https://github.com/invertase/hot-updater)를 사용한 수동 OTA 업데이트:

```sh
yarn ota-deploy:sandbox -i # 개발 환경
yarn ota-deploy:production -i # 운영 환경
```

### 앱스토어/플레이스토어 배포

[Fastlane](https://fastlane.tools/)을 사용한 배포:

```sh
# Android
cd android
fastlane android release_candidate scheme:sandbox # 개발 환경
fastlane android release_candidate scheme:production # 운영 환경

# iOS
cd ios
fastlane ios release_candidate scheme:sandbox # 개발 환경
fastlane ios release_candidate scheme:production # 운영 환경
```

## 기여하기

프로젝트에 기여하고 싶으시다면 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고해주세요.

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE.md](LICENSE.md)를 참고해주세요.

## 연락처

문의사항이나 버그 리포트는 GitHub Issues를 통해 제출해주세요.
