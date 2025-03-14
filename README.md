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
npm install
cd ios && pod install && cd ..
```

4. API 코드 생성
```sh
npm run codegen
```
이 명령어는 `subprojects/scc-api/api-spec.yaml` OpenAPI 명세를 기반으로 TypeScript API 클라이언트 코드를 생성합니다. API 명세가 변경될 때마다 실행해주세요.

5. 개발 서버 실행
```sh
npm start
```

6. 앱 실행
```sh
# iOS
npm run ios

# Android
npm run android
```

## 배포

### OTA 업데이트

[hot-updater](https://github.com/invertase/hot-updater)를 사용한 OTA 업데이트:

```sh
npm run ota-deploy:sandbox -- -i # 개발 환경
npm run ota-deploy:production -- -i # 운영 환경
```

### 앱스토어/플레이스토어 배포

[Fastlane](https://fastlane.tools/)을 사용한 배포:

```sh
# Android
cd android
fastlane android release_candidate scheme:sanbdox # 개발 환경
fastlane android release_candidate scheme:production # 운영 환경

# iOS
cd ios
fastlane ios release_candidate scheme:sanbdox # 개발 환경
fastlane ios release_candidate scheme:production # 운영 환경
```

## 기여하기

프로젝트에 기여하고 싶으시다면 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고해주세요.

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE.md](LICENSE.md)를 참고해주세요.

## 연락처

문의사항이나 버그 리포트는 GitHub Issues를 통해 제출해주세요.
