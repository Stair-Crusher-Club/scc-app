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

# S3 버킷 존재 확인
if ! aws s3 ls "s3://$BUCKET_NAME" > /dev/null 2>&1; then
    echo -e "${RED}Error: S3 버킷 '$BUCKET_NAME'에 접근할 수 없습니다.${NC}"
    echo "Terraform이 적용되었는지, AWS 자격 증명이 올바른지 확인해주세요."
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
S3_ENDPOINT=$(terraform output -raw s3_website_endpoint 2>/dev/null)
CLOUDFRONT_DOMAIN=$(terraform output -raw cloudfront_domain_name 2>/dev/null)

echo ""
echo "📍 접근 URL:"
if [ -n "$S3_ENDPOINT" ] && [ "$S3_ENDPOINT" != "null" ]; then
    echo "   S3: http://$S3_ENDPOINT"
fi

if [ -n "$CLOUDFRONT_DOMAIN" ] && [ "$CLOUDFRONT_DOMAIN" != "null" ]; then
    echo "   CloudFront: https://$CLOUDFRONT_DOMAIN"
fi

echo ""
echo -e "${YELLOW}💡 팁: CloudFront 배포는 전 세계로 전파되는데 최대 15분이 걸릴 수 있습니다.${NC}"
