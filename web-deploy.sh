#!/bin/bash

# StairCrusher Club Web 배포 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 변수 설정
BUCKET_NAME="staircrusher-club-web"
BUILD_DIR="web-dist"
DISTRIBUTION_ID="E3RDKBHB12EC6A"

echo -e "${YELLOW}StairCrusher Club Web 배포를 시작합니다...${NC}"

# React 프로젝트 경로 확인
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}Error: $BUILD_DIR 디렉토리를 찾을 수 없습니다.${NC}"
    exit 1
fi

# 산출물 구성 검증 (업로드 전 fail-fast)
# 아래 sync 가 --delete 라, web-dist 에 3개 표면(SPA / bbucle-road / articles)이 다 없으면
# 빠진 표면이 prod 에서 통째로 지워진다. `yarn web:build` 를 통째로 돌리지 않고
# webpack 만 돌린 산출물로 배포하면 실제로 그렇게 된다.
echo -e "${YELLOW}산출물 구성 검증 중 (SPA / bbucle-road / articles)...${NC}"
verify_fail() {
    echo -e "${RED}❌ $1${NC}"
    echo "   'yarn web:build' 를 처음부터 다시 실행한 뒤 배포하세요."
    exit 1
}
# ① 메인 앱(SPA): react-native-web 부팅 마커 + 고정 파일명 진입 청크
grep -q 'id="root"' "$BUILD_DIR/index.html" 2>/dev/null \
    || verify_fail "$BUILD_DIR/index.html 에 id=\"root\" 가 없습니다 (SPA 표면 누락/손상)."
for entry in bundle articles-analytics; do
    [ -s "$BUILD_DIR/$entry.js" ] \
        || verify_fail "$BUILD_DIR/$entry.js 가 없습니다 (진입 청크 누락)."
done
# ② 뿌클로드: generate-og-pages.js 의 prerender 산출물
grep -q 'id="root"' "$BUILD_DIR/bbucle-road/index.html" 2>/dev/null \
    || verify_fail "$BUILD_DIR/bbucle-road/index.html 이 없거나 손상됐습니다 (prerender 누락)."
# ③ 아티클(정적): 커밋된 web-articles/manifest.json 의 top-level 글 수와 1:1 이어야 한다.
#    build-articles.js 의 reassembleDist 가 parent 없는 항목만 web-dist/articles/<slug>/ 로 복사한다.
ARTICLES_EXPECTED=$(python3 -c 'import json;m=json.load(open("web-articles/manifest.json"));print(len([a for a in m.values() if not a.get("parent")]))')
ARTICLES_BUILT=$(find "$BUILD_DIR/articles" -mindepth 2 -maxdepth 2 -name index.html 2>/dev/null | wc -l | tr -d ' ')
if [ "$ARTICLES_BUILT" != "$ARTICLES_EXPECTED" ]; then
    verify_fail "아티클 수 불일치: web-dist=$ARTICLES_BUILT, manifest=$ARTICLES_EXPECTED."
fi
echo -e "${GREEN}✅ 구성 검증 통과 (아티클 ${ARTICLES_BUILT}건).${NC}"

# S3 버킷 존재 확인
# stderr 만 캡처해서 그대로 출력한다 — 예전엔 `2>&1`로 삼켜서 AccessDenied(IAM 권한 부족)와
# 자격증명 만료를 구분할 수 없었고, 안내문("Terraform이 적용되었는지")이 오진을 유도했다.
if ! S3_LS_ERR=$(aws s3 ls "s3://$BUCKET_NAME" 2>&1 >/dev/null); then
    echo -e "${RED}Error: S3 버킷 '$BUCKET_NAME'에 접근할 수 없습니다.${NC}"
    echo "$S3_LS_ERR"
    echo "→ AccessDenied 면 IAM 권한(s3:ListBucket) 부족, 그 외엔 AWS 자격증명 문제입니다."
    exit 1
fi

# 빌드 파일 업로드
echo -e "${YELLOW}빌드 파일을 S3에 업로드 중...${NC}"
aws s3 sync "$BUILD_DIR/" "s3://$BUCKET_NAME" --delete

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ S3 업로드 완료!${NC}"
else
    echo -e "${RED}❌ S3 업로드 실패!${NC}"
    exit 1
fi

# 고정 파일명 진입 파일(bundle.js)·HTML 은 Cache-Control=no-cache 로 재설정한다.
# 이들은 파일명이 고정이라 Cache-Control 이 없으면 브라우저가 heuristic 캐시로 옛 번들을
# 계속 물어, 배포해도 사용자에게 반영되지 않는다(예: 버튼이 안 먹는 옛 popup 번들).
# CloudFront invalidation 은 edge 캐시만 비우고 브라우저 캐시는 못 비우므로 origin 헤더로 강제한다.
# (해시 파일명 asset 은 내용이 바뀌면 이름이 바뀌므로 그대로 둔다.)
echo -e "${YELLOW}진입 파일(bundle.js/articles-analytics.js/HTML) Cache-Control=no-cache 재설정 중...${NC}"
# 고정 파일명 진입 청크들 (webpack output.filename='[name].js').
# articles-analytics.js 는 정적 /articles 페이지의 계측 번들 — 캐시되면 계측 변경이
# 사용자에게 영영 반영되지 않는다.
for entry in bundle articles-analytics; do
    aws s3 cp "s3://$BUCKET_NAME/$entry.js" "s3://$BUCKET_NAME/$entry.js" \
        --metadata-directive REPLACE --cache-control "no-cache" \
        --content-type "application/javascript" > /dev/null
    if aws s3 ls "s3://$BUCKET_NAME/$entry.js.map" > /dev/null 2>&1; then
        aws s3 cp "s3://$BUCKET_NAME/$entry.js.map" "s3://$BUCKET_NAME/$entry.js.map" \
            --metadata-directive REPLACE --cache-control "no-cache" \
            --content-type "application/json" > /dev/null
    fi
done
# 모든 index.html (루트 SPA + bbucle-road prerender + articles 정적) no-cache
aws s3 cp "s3://$BUCKET_NAME/" "s3://$BUCKET_NAME/" --recursive \
    --exclude "*" --include "*.html" \
    --metadata-directive REPLACE --cache-control "no-cache" \
    --content-type "text/html; charset=utf-8" > /dev/null
echo -e "${GREEN}✅ 진입 파일 Cache-Control 재설정 완료!${NC}"

# CloudFront Distribution ID 가져오기
echo -e "${YELLOW}CloudFront 캐시 무효화 확인 중...${NC}"
if [ -n "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "null" ] && [ "$DISTRIBUTION_ID" != "" ]; then
    echo -e "${YELLOW}CloudFront 캐시 무효화 중...${NC}"
    aws cloudfront create-invalidation \
        --distribution-id "$DISTRIBUTION_ID" \
        --paths "/*" > /dev/null

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ CloudFront 캐시 무효화 완료!${NC}"
    else
        echo -e "${YELLOW}⚠️  CloudFront 캐시 무효화 실패 (수동으로 진행해주세요)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  CloudFront Distribution ID를 찾을 수 없습니다. S3만 업데이트되었습니다.${NC}"
    echo -e "${YELLOW}💡 CloudFront를 사용 중이라면 AWS 콘솔에서 수동으로 캐시를 무효화해주세요.${NC}"
fi

# 배포 완료 메시지
echo -e "${GREEN}🎉 배포 완료!${NC}"

# URL 출력
# (예전엔 `terraform output` 으로 도메인을 읽었으나 scc-app 에는 .tf 가 없어 항상 빈 값이었고,
#  terraform 이 없는 CI 러너에서는 `set -e` 때문에 배포 성공 후 스크립트가 죽었다.)
echo ""
echo "📍 접근 URL: https://web.staircrusher.club"

echo ""
echo -e "${YELLOW}💡 팁: CloudFront 배포는 전 세계로 전파되는데 최대 15분이 걸릴 수 있습니다.${NC}"
