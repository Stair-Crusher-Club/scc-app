import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import styled from 'styled-components/native';

import { useEditMode } from '../context/EditModeContext';
import { apiConfig } from '../../../config/api';
import { color } from '@/constant/color';
import ImageUploader from '../components/ImageUploader';
import RegionDetailModal from '../components/RegionDetailModal';
import type { BbucleRoadClickableRegionDto } from '@/generated-sources/openapi';
import { loginWithKakao, logoutFromKakao } from '../../../utils/kakaoAuth';

export default function EditSidebar() {
  const editContext = useEditMode();
  const [jsonInput, setJsonInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // 이미지 프리뷰용 fake region 객체 생성
  const previewRegion = useMemo<BbucleRoadClickableRegionDto | null>(() => {
    if (!previewImageUrl) return null;
    return {
      id: 'preview',
      polygon: [],
      modalImageUrls: [previewImageUrl],
    };
  }, [previewImageUrl]);

  // Check login status on mount
  useEffect(() => {
    const storedToken = window.localStorage.getItem('sccAccessToken');
    const storedUserName = window.localStorage.getItem('sccUserName');
    if (storedToken) {
      setIsLoggedIn(true);
      setUserName(storedUserName);
      apiConfig.accessToken = storedToken;
    }
  }, []);

  const handleKakaoLogin = useCallback(() => {
    setLoginError(null);
    const result = loginWithKakao();
    if (!result.ok) {
      setLoginError(result.error ?? '로그인을 시작하지 못했습니다.');
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logoutFromKakao();
    setIsLoggedIn(false);
    setUserName(null);
    setLoginError(null);
  }, []);

  if (!editContext) return null;

  const {
    data,
    updateData,
    exportToJson,
    importFromJson,
    editingRegion,
    startAddingRegion,
    startAddingSeatViewRegion,
    startEditingRegion,
    startEditingSeatViewRegion,
    addModalImageToRegion,
    removeModalImageFromRegion,
    clearRegionPoints,
    undoRegionPoint,
    saveEditingRegion,
    cancelEditingRegion,
    deleteRegion,
    deleteSeatViewRegion,
  } = editContext;

  const handleExportJson = useCallback(async () => {
    const json = exportToJson();
    try {
      await navigator.clipboard.writeText(json);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, [exportToJson]);

  const handleImportJson = useCallback(() => {
    setImportError(null);
    const success = importFromJson(jsonInput);
    if (success) {
      setJsonInput('');
    } else {
      setImportError('JSON 파싱 실패. 올바른 형식인지 확인하세요.');
    }
  }, [jsonInput, importFromJson]);

  return (
    <Container>
      <ScrollView>
        <SidebarContent>
          {/* 헤더 */}
          <Header>
            <HeaderTitle>Edit Mode</HeaderTitle>
            <EditBadge>
              <EditBadgeText>편집 중</EditBadgeText>
            </EditBadge>
          </Header>

          {/* 인증 */}
          <Section>
            <SectionTitle>인증</SectionTitle>
            {isLoggedIn ? (
              <>
                <LoginStatusRow>
                  <LoginStatusIcon>✓</LoginStatusIcon>
                  <LoginStatusText>{userName || '로그인됨'}</LoginStatusText>
                </LoginStatusRow>
                <LogoutButton onPress={handleLogout}>
                  <LogoutButtonText>로그아웃</LogoutButtonText>
                </LogoutButton>
              </>
            ) : (
              <>
                <LoginStatusRow>
                  <LoginStatusIcon style={{ color: '#dc3545' }}>!</LoginStatusIcon>
                  <LoginStatusText style={{ color: '#dc3545' }}>
                    로그인 필요 (이미지 업로드용)
                  </LoginStatusText>
                </LoginStatusRow>
                {loginError && <ErrorText>{loginError}</ErrorText>}
                <KakaoLoginButton onPress={handleKakaoLogin}>
                  <KakaoLoginButtonText>카카오로 로그인</KakaoLoginButtonText>
                </KakaoLoginButton>
              </>
            )}
          </Section>

          {/* 현재 상태 */}
          <Section>
            <SectionTitle>현재 데이터</SectionTitle>
            <InfoRow>
              <InfoLabel>ID:</InfoLabel>
              <InfoValue>{data.id || '(없음)'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>제목:</InfoLabel>
              <InfoValue>{data.title || '(없음)'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>섹션 수:</InfoLabel>
              <InfoValue>{data.sections.length}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>동선 탭:</InfoLabel>
              <InfoValue>
                {data.routeSection?.routes.length || 0}개
              </InfoValue>
            </InfoRow>
          </Section>

          {/* 헤더 섹션 */}
          <Section>
            <SectionTitle>헤더 섹션</SectionTitle>
            <HeaderEditPanel>
              {/* 최종 업데이트 */}
              <FieldGroup>
                <FieldLabel>최종 업데이트</FieldLabel>
                <FieldInput
                  value={data.lastUpdatedDate || ''}
                  onChangeText={(text: string) =>
                    updateData((prev) => ({
                      ...prev,
                      lastUpdatedDate: text,
                    }))
                  }
                  placeholder="예: 최종 업데이트 2025.12.05"
                  placeholderTextColor="#999"
                />
              </FieldGroup>

              {/* 접근성 한마디 - 데스크탑 */}
              <FieldGroup>
                <FieldLabel>접근성 한마디 (HTML) - 데스크탑</FieldLabel>
                <HtmlTextAreaSmall
                  multiline
                  value={data.wheelchairUserCommentHtml || ''}
                  onChangeText={(text: string) =>
                    updateData((prev) => ({
                      ...prev,
                      wheelchairUserCommentHtml: text,
                    }))
                  }
                  placeholder="<b>볼드 텍스트</b> 일반 텍스트..."
                  placeholderTextColor="#999"
                />
              </FieldGroup>

              {/* 접근성 한마디 - 모바일 */}
              <FieldGroup>
                <FieldLabel>접근성 한마디 (HTML) - 모바일</FieldLabel>
                <HtmlTextAreaSmall
                  multiline
                  value={data.wheelchairUserCommentHtmlMobile || ''}
                  onChangeText={(text: string) =>
                    updateData((prev) => ({
                      ...prev,
                      wheelchairUserCommentHtmlMobile: text,
                    }))
                  }
                  placeholder="모바일용 줄바꿈 다르게..."
                  placeholderTextColor="#999"
                />
              </FieldGroup>

              {/* 모바일 타이틀 이미지 */}
              <FieldGroup>
                <FieldLabel>모바일 타이틀 이미지 (@2x)</FieldLabel>
                {data.mobileTitleImageUrl ? (
                  <ImagePreviewContainer>
                    <ImagePreview source={{ uri: data.mobileTitleImageUrl }} />
                    <ImageRemoveButton
                      onPress={() =>
                        updateData((prev) => ({
                          ...prev,
                          mobileTitleImageUrl: undefined,
                        }))
                      }
                    >
                      <ImageRemoveButtonText>×</ImageRemoveButtonText>
                    </ImageRemoveButton>
                  </ImagePreviewContainer>
                ) : (
                  <ImageUploader
                    onUploadComplete={(url) =>
                      updateData((prev) => ({
                        ...prev,
                        mobileTitleImageUrl: url,
                      }))
                    }
                    buttonText="모바일 타이틀 이미지 업로드"
                  />
                )}
              </FieldGroup>

              {/* 모바일 배경 이미지 */}
              <FieldGroup>
                <FieldLabel>모바일 배경 이미지 (@2x)</FieldLabel>
                {data.mobileHeaderBackgroundImageUrl ? (
                  <ImagePreviewContainer>
                    <ImagePreview
                      source={{ uri: data.mobileHeaderBackgroundImageUrl }}
                    />
                    <ImageRemoveButton
                      onPress={() =>
                        updateData((prev) => ({
                          ...prev,
                          mobileHeaderBackgroundImageUrl: undefined,
                        }))
                      }
                    >
                      <ImageRemoveButtonText>×</ImageRemoveButtonText>
                    </ImageRemoveButton>
                  </ImagePreviewContainer>
                ) : (
                  <ImageUploader
                    onUploadComplete={(url) =>
                      updateData((prev) => ({
                        ...prev,
                        mobileHeaderBackgroundImageUrl: url,
                      }))
                    }
                    buttonText="모바일 배경 이미지 업로드"
                  />
                )}
              </FieldGroup>

              {/* 배경 이미지 캡션 */}
              <FieldGroup>
                <FieldLabel>배경 이미지 캡션</FieldLabel>
                <FieldInput
                  value={data.headerImageCaption || ''}
                  onChangeText={(text: string) =>
                    updateData((prev) => ({
                      ...prev,
                      headerImageCaption: text,
                    }))
                  }
                  placeholder="예: *플레이브 콘서트 사진"
                  placeholderTextColor={color.gray40}
                />
              </FieldGroup>

              {/* OG 공유 이미지 */}
              <FieldGroup>
                <FieldLabel>공유 미리보기 이미지 (OG)</FieldLabel>
                <ImageUploader
                  currentImageUrl={data.ogImageUrl}
                  onUploadComplete={(url) =>
                    updateData((prev) => ({
                      ...prev,
                      ogImageUrl: url,
                    }))
                  }
                />
                {data.ogImageUrl && (
                  <OgImagePreview>
                    <OgImagePreviewImg
                      source={{ uri: data.ogImageUrl }}
                      resizeMode="contain"
                    />
                  </OgImagePreview>
                )}
              </FieldGroup>
            </HeaderEditPanel>
          </Section>

          {/* Region 편집 */}
          <Section>
            <SectionTitle>Region 편집</SectionTitle>
            {editingRegion ? (
              // 편집 중인 region 컨트롤
              <RegionEditPanel>
                <RegionEditHeader>
                  <RegionEditTitle>
                    {editingRegion.regionIndex !== null
                      ? `Region #${editingRegion.regionIndex + 1} 편집`
                      : '새 Region 추가'}
                  </RegionEditTitle>
                  <RegionRouteTag>
                    Route #{editingRegion.routeIndex + 1}
                  </RegionRouteTag>
                </RegionEditHeader>

                <RegionEditInfo>
                  <InfoRow>
                    <InfoLabel>점 개수:</InfoLabel>
                    <InfoValue>{editingRegion.points.length}개</InfoValue>
                  </InfoRow>
                </RegionEditInfo>

                <RegionEditActions>
                  <SmallButton onPress={clearRegionPoints}>
                    <SmallButtonText>초기화</SmallButtonText>
                  </SmallButton>
                  <SmallButton
                    onPress={undoRegionPoint}
                    disabled={editingRegion.pointsUndoStack.length === 0}
                    style={{
                      opacity: editingRegion.pointsUndoStack.length > 0 ? 1 : 0.5,
                    }}
                  >
                    <SmallButtonText>⌘Z 실행취소</SmallButtonText>
                  </SmallButton>
                </RegionEditActions>

                {/* 모달 이미지 관리 */}
                <ModalImageSection>
                  <ModalImageLabel>
                    클릭 시 표시할 이미지 ({editingRegion.modalImageUrls.length}개)
                  </ModalImageLabel>
                  <ModalImageList>
                    {editingRegion.modalImageUrls.map((url, index) => (
                      <ModalImageItem key={index}>
                        <TouchableOpacity onPress={() => setPreviewImageUrl(url)}>
                          <ModalImagePreview source={{ uri: url }} />
                        </TouchableOpacity>
                        <ModalImageRemove
                          onPress={() => removeModalImageFromRegion(index)}
                        >
                          <ModalImageRemoveText>×</ModalImageRemoveText>
                        </ModalImageRemove>
                      </ModalImageItem>
                    ))}
                    <AddModalImageWrapper>
                      <ImageUploader
                        onUploadComplete={addModalImageToRegion}
                        buttonText="+"
                        compact
                      />
                    </AddModalImageWrapper>
                  </ModalImageList>
                </ModalImageSection>

                {/* 저장/취소 버튼 */}
                <RegionEditButtons>
                  <CancelButton onPress={cancelEditingRegion}>
                    <CancelButtonText>취소</CancelButtonText>
                  </CancelButton>
                  <SaveButton
                    onPress={saveEditingRegion}
                    disabled={editingRegion.points.length < 3}
                    style={{
                      opacity: editingRegion.points.length >= 3 ? 1 : 0.5,
                    }}
                  >
                    <SaveButtonText>저장</SaveButtonText>
                  </SaveButton>
                </RegionEditButtons>
              </RegionEditPanel>
            ) : (
              // Region 목록
              <>
                {data.routeSection?.routes.map((route, routeIndex) => {
                  const regions = route.interactiveImage?.clickableRegions || [];
                  if (!route.interactiveImage) return null;
                  return (
                    <RouteRegionSection key={routeIndex}>
                      <RouteRegionHeader>
                        <RouteRegionTitle>{route.tabLabel || `Route #${routeIndex + 1}`}</RouteRegionTitle>
                        <AddRegionButton
                          onPress={() => startAddingRegion(routeIndex)}
                        >
                          <AddRegionButtonText>+ Region</AddRegionButtonText>
                        </AddRegionButton>
                      </RouteRegionHeader>
                      {regions.length > 0 ? (
                        regions.map((region, regionIndex) => (
                          <RegionListItem key={region.id}>
                            <RegionListHeader>
                              <RegionListInfo>
                                <RegionListIndex>#{regionIndex + 1}</RegionListIndex>
                                <RegionListDetail>
                                  점 {region.polygon.length}개
                                </RegionListDetail>
                              </RegionListInfo>
                              <RegionListActions>
                                <RegionEditButton
                                  onPress={() =>
                                    startEditingRegion(
                                      routeIndex,
                                      regionIndex,
                                      region.polygon,
                                      region.modalImageUrls || [],
                                    )
                                  }
                                >
                                  <RegionEditButtonText>편집</RegionEditButtonText>
                                </RegionEditButton>
                                <RegionDeleteButton
                                  onPress={() => deleteRegion(routeIndex, regionIndex)}
                                >
                                  <RegionDeleteButtonText>×</RegionDeleteButtonText>
                                </RegionDeleteButton>
                              </RegionListActions>
                            </RegionListHeader>
                            {(region.modalImageUrls?.length ?? 0) > 0 && (
                              <RegionImageList>
                                {region.modalImageUrls?.map((url: string, imgIndex: number) => (
                                  <TouchableOpacity
                                    key={imgIndex}
                                    onPress={() => setPreviewImageUrl(url)}
                                  >
                                    <RegionImageThumb source={{ uri: url }} />
                                  </TouchableOpacity>
                                ))}
                              </RegionImageList>
                            )}
                          </RegionListItem>
                        ))
                      ) : (
                        <NoRegionsText>Region 없음</NoRegionsText>
                      )}
                    </RouteRegionSection>
                  );
                })}
              </>
            )}
          </Section>

          {/* 동선 설명 HTML 편집 */}
          {data.routeSection?.routes && data.routeSection.routes.length > 0 && (
            <Section>
              <SectionTitle>동선 설명 HTML</SectionTitle>
              {data.routeSection.routes.map((route, routeIndex) => (
                <RouteHtmlEditPanel key={route.id}>
                  <RouteHtmlHeader>
                    <RouteHtmlTitle>{route.tabLabel || `Route #${routeIndex + 1}`}</RouteHtmlTitle>
                  </RouteHtmlHeader>
                  <HtmlTextArea
                    multiline
                    value={(route as { descriptionHtml?: string }).descriptionHtml || ''}
                    onChangeText={(text: string) =>
                      updateData((prev) => ({
                        ...prev,
                        routeSection: prev.routeSection
                          ? {
                              ...prev.routeSection,
                              routes: prev.routeSection.routes.map((r, i) =>
                                i === routeIndex
                                  ? { ...r, descriptionHtml: text }
                                  : r,
                              ),
                            }
                          : null,
                      }))
                    }
                    placeholder="<div>HTML 콘텐츠...</div>"
                    placeholderTextColor="#999"
                  />

                  {/* 모바일 Interactive 이미지 */}
                  <FieldGroup style={{ marginTop: 12 }}>
                    <FieldLabel>모바일 Interactive 이미지 (@2x)</FieldLabel>
                    {(route.interactiveImage as { mobileUrl?: string })?.mobileUrl ? (
                      <ImagePreviewContainer>
                        <ImagePreview
                          source={{
                            uri: (route.interactiveImage as { mobileUrl?: string }).mobileUrl,
                          }}
                        />
                        <ImageRemoveButton
                          onPress={() =>
                            updateData((prev) => ({
                              ...prev,
                              routeSection: prev.routeSection
                                ? {
                                    ...prev.routeSection,
                                    routes: prev.routeSection.routes.map((r, i) =>
                                      i === routeIndex
                                        ? {
                                            ...r,
                                            interactiveImage: {
                                              ...r.interactiveImage,
                                              mobileUrl: undefined,
                                            },
                                          }
                                        : r,
                                    ),
                                  }
                                : null,
                            }))
                          }
                        >
                          <ImageRemoveButtonText>×</ImageRemoveButtonText>
                        </ImageRemoveButton>
                      </ImagePreviewContainer>
                    ) : (
                      <ImageUploader
                        onUploadComplete={(url) =>
                          updateData((prev) => ({
                            ...prev,
                            routeSection: prev.routeSection
                              ? {
                                  ...prev.routeSection,
                                  routes: prev.routeSection.routes.map((r, i) =>
                                    i === routeIndex
                                      ? {
                                          ...r,
                                          interactiveImage: {
                                            ...r.interactiveImage,
                                            mobileUrl: url,
                                          },
                                        }
                                      : r,
                                  ),
                                }
                              : null,
                          }))
                        }
                        buttonText="모바일 이미지 업로드"
                      />
                    )}
                  </FieldGroup>
                </RouteHtmlEditPanel>
              ))}
            </Section>
          )}

          {/* 좌석 뷰 섹션 편집 */}
          {data.seatViewSection && (
            <Section>
              <SectionTitle>좌석 뷰 섹션</SectionTitle>
              <SeatViewEditPanel>
                {/* 타이틀 */}
                <FieldGroup>
                  <FieldLabel>타이틀</FieldLabel>
                  <FieldInput
                    value={data.seatViewSection.title}
                    onChangeText={(text: string) =>
                      updateData((prev) => ({
                        ...prev,
                        seatViewSection: prev.seatViewSection
                          ? { ...prev.seatViewSection, title: text }
                          : null,
                      }))
                    }
                    placeholder="예: 좌석 시야 안내"
                    placeholderTextColor="#999"
                  />
                </FieldGroup>

                {/* Interactive 이미지 */}
                <FieldGroup>
                  <FieldLabel>Interactive 지도 이미지</FieldLabel>
                  {data.seatViewSection.interactiveImage?.url ? (
                    <ImagePreviewContainer>
                      <ImagePreview
                        source={{ uri: data.seatViewSection.interactiveImage.url }}
                      />
                      <ImageRemoveButton
                        onPress={() =>
                          updateData((prev) => ({
                            ...prev,
                            seatViewSection: prev.seatViewSection
                              ? {
                                  ...prev.seatViewSection,
                                  interactiveImage: undefined,
                                }
                              : null,
                          }))
                        }
                      >
                        <ImageRemoveButtonText>×</ImageRemoveButtonText>
                      </ImageRemoveButton>
                    </ImagePreviewContainer>
                  ) : (
                    <ImageUploader
                      onUploadComplete={(url) =>
                        updateData((prev) => ({
                          ...prev,
                          seatViewSection: prev.seatViewSection
                            ? {
                                ...prev.seatViewSection,
                                interactiveImage: {
                                  url,
                                  clickableRegions: [],
                                },
                              }
                            : null,
                        }))
                      }
                      buttonText="지도 이미지 업로드"
                    />
                  )}
                </FieldGroup>

                {/* 모바일 Interactive 이미지 */}
                <FieldGroup>
                  <FieldLabel>모바일 Interactive 이미지 (@2x)</FieldLabel>
                  {(data.seatViewSection.interactiveImage as { mobileUrl?: string })
                    ?.mobileUrl ? (
                    <ImagePreviewContainer>
                      <ImagePreview
                        source={{
                          uri: (
                            data.seatViewSection.interactiveImage as {
                              mobileUrl?: string;
                            }
                          ).mobileUrl,
                        }}
                      />
                      <ImageRemoveButton
                        onPress={() =>
                          updateData((prev) => ({
                            ...prev,
                            seatViewSection: prev.seatViewSection
                              ? {
                                  ...prev.seatViewSection,
                                  interactiveImage: prev.seatViewSection.interactiveImage
                                    ? {
                                        ...prev.seatViewSection.interactiveImage,
                                        mobileUrl: undefined,
                                      }
                                    : undefined,
                                }
                              : null,
                          }))
                        }
                      >
                        <ImageRemoveButtonText>×</ImageRemoveButtonText>
                      </ImageRemoveButton>
                    </ImagePreviewContainer>
                  ) : (
                    <ImageUploader
                      onUploadComplete={(url) =>
                        updateData((prev) => ({
                          ...prev,
                          seatViewSection: prev.seatViewSection
                            ? {
                                ...prev.seatViewSection,
                                interactiveImage: prev.seatViewSection.interactiveImage
                                  ? {
                                      ...prev.seatViewSection.interactiveImage,
                                      mobileUrl: url,
                                    }
                                  : {
                                      url: '',
                                      clickableRegions: [],
                                      mobileUrl: url,
                                    },
                              }
                            : null,
                        }))
                      }
                      buttonText="모바일 이미지 업로드"
                    />
                  )}
                </FieldGroup>

                {/* seatViewSection Region 편집 */}
                {data.seatViewSection.interactiveImage?.url && (
                  <FieldGroup>
                    <FieldLabel>Regions</FieldLabel>
                    {editingRegion && editingRegion.sectionType === 'seatView' ? (
                      <RegionEditPanel>
                        <RegionEditHeader>
                          <RegionEditTitle>
                            {editingRegion.regionIndex !== null
                              ? `Region #${editingRegion.regionIndex + 1} 편집`
                              : '새 Region 추가'}
                          </RegionEditTitle>
                          <RegionRouteTag>SeatView</RegionRouteTag>
                        </RegionEditHeader>

                        <RegionEditInfo>
                          <InfoRow>
                            <InfoLabel>점 개수:</InfoLabel>
                            <InfoValue>{editingRegion.points.length}개</InfoValue>
                          </InfoRow>
                        </RegionEditInfo>

                        <RegionEditActions>
                          <SmallButton onPress={clearRegionPoints}>
                            <SmallButtonText>초기화</SmallButtonText>
                          </SmallButton>
                          <SmallButton
                            onPress={undoRegionPoint}
                            disabled={editingRegion.pointsUndoStack.length === 0}
                            style={{
                              opacity: editingRegion.pointsUndoStack.length > 0 ? 1 : 0.5,
                            }}
                          >
                            <SmallButtonText>⌘Z 실행취소</SmallButtonText>
                          </SmallButton>
                        </RegionEditActions>

                        <ModalImageSection>
                          <ModalImageLabel>
                            클릭 시 표시할 이미지 ({editingRegion.modalImageUrls.length}개)
                          </ModalImageLabel>
                          <ModalImageList>
                            {editingRegion.modalImageUrls.map((url, index) => (
                              <ModalImageItem key={index}>
                                <TouchableOpacity onPress={() => setPreviewImageUrl(url)}>
                                  <ModalImagePreview source={{ uri: url }} />
                                </TouchableOpacity>
                                <ModalImageRemove
                                  onPress={() => removeModalImageFromRegion(index)}
                                >
                                  <ModalImageRemoveText>×</ModalImageRemoveText>
                                </ModalImageRemove>
                              </ModalImageItem>
                            ))}
                            <AddModalImageWrapper>
                              <ImageUploader
                                onUploadComplete={addModalImageToRegion}
                                buttonText="+"
                                compact
                              />
                            </AddModalImageWrapper>
                          </ModalImageList>
                        </ModalImageSection>

                        <RegionEditButtons>
                          <CancelButton onPress={cancelEditingRegion}>
                            <CancelButtonText>취소</CancelButtonText>
                          </CancelButton>
                          <SaveButton
                            onPress={saveEditingRegion}
                            disabled={editingRegion.points.length < 3}
                            style={{
                              opacity: editingRegion.points.length >= 3 ? 1 : 0.5,
                            }}
                          >
                            <SaveButtonText>저장</SaveButtonText>
                          </SaveButton>
                        </RegionEditButtons>
                      </RegionEditPanel>
                    ) : (
                      <>
                        <SeatViewRegionHeader>
                          <AddRegionButton onPress={startAddingSeatViewRegion}>
                            <AddRegionButtonText>+ Region 추가</AddRegionButtonText>
                          </AddRegionButton>
                        </SeatViewRegionHeader>
                        {(data.seatViewSection.interactiveImage.clickableRegions || []).length > 0 ? (
                          (data.seatViewSection.interactiveImage.clickableRegions || []).map(
                            (region, regionIndex) => (
                              <RegionListItem key={region.id}>
                                <RegionListHeader>
                                  <RegionListInfo>
                                    <RegionListIndex>#{regionIndex + 1}</RegionListIndex>
                                    <RegionListDetail>
                                      점 {region.polygon.length}개
                                    </RegionListDetail>
                                  </RegionListInfo>
                                  <RegionListActions>
                                    <RegionEditButton
                                      onPress={() =>
                                        startEditingSeatViewRegion(
                                          regionIndex,
                                          region.polygon,
                                          region.modalImageUrls || [],
                                        )
                                      }
                                    >
                                      <RegionEditButtonText>편집</RegionEditButtonText>
                                    </RegionEditButton>
                                    <RegionDeleteButton
                                      onPress={() => deleteSeatViewRegion(regionIndex)}
                                    >
                                      <RegionDeleteButtonText>×</RegionDeleteButtonText>
                                    </RegionDeleteButton>
                                  </RegionListActions>
                                </RegionListHeader>
                                {(region.modalImageUrls?.length ?? 0) > 0 && (
                                  <RegionImageList>
                                    {region.modalImageUrls?.map((url: string, imgIndex: number) => (
                                      <TouchableOpacity
                                        key={imgIndex}
                                        onPress={() => setPreviewImageUrl(url)}
                                      >
                                        <RegionImageThumb source={{ uri: url }} />
                                      </TouchableOpacity>
                                    ))}
                                  </RegionImageList>
                                )}
                              </RegionListItem>
                            ),
                          )
                        ) : (
                          <NoRegionsText>Region 없음</NoRegionsText>
                        )}
                      </>
                    )}
                  </FieldGroup>
                )}

                {/* 설명 HTML */}
                <FieldGroup>
                  <FieldLabel>설명 HTML ({data.seatViewSection.descriptionHtmls?.length || 0}개)</FieldLabel>
                  {data.seatViewSection.descriptionHtmls?.map((html, index) => (
                    <HtmlEditRow key={index}>
                      <HtmlTextAreaSmall
                        multiline
                        value={html}
                        onChangeText={(text: string) =>
                          updateData((prev) => ({
                            ...prev,
                            seatViewSection: prev.seatViewSection
                              ? {
                                  ...prev.seatViewSection,
                                  descriptionHtmls: prev.seatViewSection.descriptionHtmls?.map(
                                    (h, i) => (i === index ? text : h),
                                  ),
                                }
                              : null,
                          }))
                        }
                        placeholder="<div>HTML 콘텐츠...</div>"
                        placeholderTextColor="#999"
                      />
                      <HtmlRemoveButton
                        onPress={() =>
                          updateData((prev) => ({
                            ...prev,
                            seatViewSection: prev.seatViewSection
                              ? {
                                  ...prev.seatViewSection,
                                  descriptionHtmls: prev.seatViewSection.descriptionHtmls?.filter(
                                    (_, i) => i !== index,
                                  ),
                                }
                              : null,
                          }))
                        }
                      >
                        <HtmlRemoveButtonText>×</HtmlRemoveButtonText>
                      </HtmlRemoveButton>
                    </HtmlEditRow>
                  ))}
                  <AddHtmlButton
                    onPress={() =>
                      updateData((prev) => ({
                        ...prev,
                        seatViewSection: prev.seatViewSection
                          ? {
                              ...prev.seatViewSection,
                              descriptionHtmls: [
                                ...(prev.seatViewSection.descriptionHtmls || []),
                                '',
                              ],
                            }
                          : null,
                      }))
                    }
                  >
                    <AddHtmlButtonText>+ 설명 추가</AddHtmlButtonText>
                  </AddHtmlButton>
                </FieldGroup>
              </SeatViewEditPanel>
            </Section>
          )}

          {/* 근처 장소 섹션 편집 */}
          {data.nearbyPlacesSection && (
            <Section>
              <SectionTitle>근처 장소 섹션</SectionTitle>
              <NearbyPlacesEditPanel>
                {/* 타이틀 */}
                <FieldGroup>
                  <FieldLabel>타이틀</FieldLabel>
                  <FieldInput
                    value={data.nearbyPlacesSection.title}
                    onChangeText={(text: string) =>
                      updateData((prev) => ({
                        ...prev,
                        nearbyPlacesSection: prev.nearbyPlacesSection
                          ? { ...prev.nearbyPlacesSection, title: text }
                          : null,
                      }))
                    }
                    placeholder="예: 고척스카이돔 근처 맛집 정보"
                    placeholderTextColor="#999"
                  />
                </FieldGroup>

                {/* 지도 이미지 */}
                <FieldGroup>
                  <FieldLabel>지도 이미지</FieldLabel>
                  {data.nearbyPlacesSection.mapImageUrl ? (
                    <ImagePreviewContainer>
                      <ImagePreview
                        source={{ uri: data.nearbyPlacesSection.mapImageUrl }}
                      />
                      <ImageRemoveButton
                        onPress={() =>
                          updateData((prev) => ({
                            ...prev,
                            nearbyPlacesSection: prev.nearbyPlacesSection
                              ? { ...prev.nearbyPlacesSection, mapImageUrl: '' }
                              : null,
                          }))
                        }
                      >
                        <ImageRemoveButtonText>×</ImageRemoveButtonText>
                      </ImageRemoveButton>
                    </ImagePreviewContainer>
                  ) : (
                    <ImageUploader
                      onUploadComplete={(url) =>
                        updateData((prev) => ({
                          ...prev,
                          nearbyPlacesSection: prev.nearbyPlacesSection
                            ? { ...prev.nearbyPlacesSection, mapImageUrl: url }
                            : null,
                        }))
                      }
                      buttonText="지도 이미지 업로드"
                    />
                  )}
                </FieldGroup>

                {/* 모바일 지도 이미지 */}
                <FieldGroup>
                  <FieldLabel>모바일 지도 이미지 (@2x)</FieldLabel>
                  {data.nearbyPlacesSection.mobileMapImageUrl ? (
                    <ImagePreviewContainer>
                      <ImagePreview
                        source={{ uri: data.nearbyPlacesSection.mobileMapImageUrl }}
                      />
                      <ImageRemoveButton
                        onPress={() =>
                          updateData((prev) => ({
                            ...prev,
                            nearbyPlacesSection: prev.nearbyPlacesSection
                              ? { ...prev.nearbyPlacesSection, mobileMapImageUrl: '' }
                              : null,
                          }))
                        }
                      >
                        <ImageRemoveButtonText>×</ImageRemoveButtonText>
                      </ImageRemoveButton>
                    </ImagePreviewContainer>
                  ) : (
                    <ImageUploader
                      onUploadComplete={(url) =>
                        updateData((prev) => ({
                          ...prev,
                          nearbyPlacesSection: prev.nearbyPlacesSection
                            ? { ...prev.nearbyPlacesSection, mobileMapImageUrl: url }
                            : null,
                        }))
                      }
                      buttonText="모바일 지도 이미지 업로드"
                    />
                  )}
                </FieldGroup>

                {/* 네이버 리스트 URL */}
                <FieldGroup>
                  <FieldLabel>네이버 리스트 URL</FieldLabel>
                  <FieldInput
                    value={data.nearbyPlacesSection.naverListUrl || ''}
                    onChangeText={(text: string) =>
                      updateData((prev) => ({
                        ...prev,
                        nearbyPlacesSection: prev.nearbyPlacesSection
                          ? { ...prev.nearbyPlacesSection, naverListUrl: text }
                          : null,
                      }))
                    }
                    placeholder="https://map.naver.com/..."
                    placeholderTextColor="#999"
                  />
                </FieldGroup>

                {/* 더 많은 장소 URL */}
                <FieldGroup>
                  <FieldLabel>더 많은 장소 URL</FieldLabel>
                  <FieldInput
                    value={data.nearbyPlacesSection.morePlacesUrl || ''}
                    onChangeText={(text: string) =>
                      updateData((prev) => ({
                        ...prev,
                        nearbyPlacesSection: prev.nearbyPlacesSection
                          ? { ...prev.nearbyPlacesSection, morePlacesUrl: text }
                          : null,
                      }))
                    }
                    placeholder="https://..."
                    placeholderTextColor="#999"
                  />
                </FieldGroup>

                {/* 섹션 삭제 */}
                <DeleteSectionButton
                  onPress={() =>
                    updateData((prev) => ({
                      ...prev,
                      nearbyPlacesSection: null,
                    }))
                  }
                >
                  <DeleteSectionButtonText>섹션 삭제</DeleteSectionButtonText>
                </DeleteSectionButton>
              </NearbyPlacesEditPanel>
            </Section>
          )}

          {/* JSON Export */}
          <Section>
            <SectionTitle>JSON Export</SectionTitle>
            <ActionButton onPress={handleExportJson}>
              <ActionButtonText>
                {copySuccess ? '✓ 복사됨!' : '📋 JSON 복사'}
              </ActionButtonText>
            </ActionButton>
          </Section>

          {/* JSON Import */}
          <Section>
            <SectionTitle>JSON Import</SectionTitle>
            <JsonTextArea
              multiline
              value={jsonInput}
              onChangeText={setJsonInput}
              placeholder="JSON을 여기에 붙여넣으세요..."
              placeholderTextColor="#999"
            />
            {importError && <ErrorText>{importError}</ErrorText>}
            <ActionButton
              onPress={handleImportJson}
              disabled={!jsonInput.trim()}
              style={{ opacity: jsonInput.trim() ? 1 : 0.5 }}
            >
              <ActionButtonText>Import</ActionButtonText>
            </ActionButton>
          </Section>

          {/* 도움말 */}
          <Section>
            <SectionTitle>단축키</SectionTitle>
            <HelpText>• Polygon 편집 중 ⌘Z: 점 취소</HelpText>
          </Section>
        </SidebarContent>
      </ScrollView>

      {/* 이미지 프리뷰 모달 */}
      <RegionDetailModal
        visible={!!previewImageUrl}
        region={previewRegion}
        onClose={() => setPreviewImageUrl(null)}
      />
    </Container>
  );
}

const Container = styled(View)`
  width: 320px;
  background-color: #f8f9fa;
  border-left-width: 1px;
  border-left-color: #e0e0e0;
`;

const SidebarContent = styled(View)`
  padding: 20px;
`;

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
`;

const HeaderTitle = styled(Text)`
  font-size: 20px;
  font-weight: 700;
  color: #333;
`;

const EditBadge = styled(View)`
  background-color: #007aff;
  padding: 4px 8px;
  border-radius: 4px;
`;

const EditBadgeText = styled(Text)`
  font-size: 12px;
  font-weight: 600;
  color: #fff;
`;

const Section = styled(View)`
  margin-bottom: 24px;
`;

const SectionTitle = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoRow = styled(View)`
  flex-direction: row;
  margin-bottom: 8px;
`;

const InfoLabel = styled(Text)`
  font-size: 14px;
  color: #666;
  width: 80px;
`;

const InfoValue = styled(Text)`
  font-size: 14px;
  color: #333;
  flex: 1;
`;

const ActionButton = styled(TouchableOpacity)`
  background-color: #007aff;
  padding: 12px 16px;
  border-radius: 8px;
  align-items: center;
`;

const ActionButtonText = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
`;

const JsonTextArea = styled(TextInput)`
  background-color: #fff;
  border-width: 1px;
  border-color: #ddd;
  border-radius: 8px;
  padding: 12px;
  min-height: 120px;
  font-size: 12px;
  font-family: monospace;
  margin-bottom: 12px;
  text-align-vertical: top;
`;

const ErrorText = styled(Text)`
  font-size: 12px;
  color: #dc3545;
  margin-bottom: 8px;
`;

const HelpText = styled(Text)`
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
`;

const LoginStatusRow = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const LoginStatusIcon = styled(Text)`
  font-size: 16px;
  font-weight: 700;
  color: #28a745;
  margin-right: 8px;
`;

const LoginStatusText = styled(Text)`
  font-size: 14px;
  color: #333;
  flex: 1;
`;

const KakaoLoginButton = styled(TouchableOpacity)`
  background-color: #fee500;
  padding: 12px 16px;
  border-radius: 8px;
  align-items: center;
`;

const KakaoLoginButtonText = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: #3c1e1e;
`;

const LogoutButton = styled(TouchableOpacity)`
  background-color: #6c757d;
  padding: 10px 16px;
  border-radius: 8px;
  align-items: center;
`;

const LogoutButtonText = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
`;

// Region 편집 관련 스타일
const RegionEditPanel = styled(View)`
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #007aff;
`;

const RegionEditHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const RegionEditTitle = styled(Text)`
  font-size: 15px;
  font-weight: 600;
  color: #333;
`;

const RegionRouteTag = styled(Text)`
  font-size: 11px;
  color: #007aff;
  background-color: #e8f4ff;
  padding: 2px 6px;
  border-radius: 4px;
`;

const RegionEditInfo = styled(View)`
  margin-bottom: 12px;
`;

const RegionEditActions = styled(View)`
  flex-direction: row;
  gap: 8px;
  margin-bottom: 12px;
`;

const SmallButton = styled(TouchableOpacity)`
  flex: 1;
  padding: 8px;
  background-color: #f0f0f0;
  border-radius: 6px;
  align-items: center;
`;

const SmallButtonText = styled(Text)`
  font-size: 12px;
  color: #333;
`;

const ModalImageSection = styled(View)`
  margin-bottom: 12px;
`;

const ModalImageLabel = styled(Text)`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
`;

const ModalImageList = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const ModalImageItem = styled(View)`
  position: relative;
`;

const ModalImagePreview = styled(Image)`
  width: 50px;
  height: 50px;
  border-radius: 4px;
  background-color: #f0f0f0;
`;

const ModalImageRemove = styled(TouchableOpacity)`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 9px;
  background-color: #dc3545;
  align-items: center;
  justify-content: center;
`;

const ModalImageRemoveText = styled(Text)`
  color: #fff;
  font-size: 12px;
  font-weight: 700;
`;

const AddModalImageWrapper = styled(View)`
  justify-content: center;
`;

const RegionEditButtons = styled(View)`
  flex-direction: row;
  gap: 8px;
`;

const CancelButton = styled(TouchableOpacity)`
  flex: 1;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 6px;
  align-items: center;
`;

const CancelButtonText = styled(Text)`
  font-size: 13px;
  font-weight: 600;
  color: #666;
`;

const SaveButton = styled(TouchableOpacity)`
  flex: 1;
  padding: 10px;
  background-color: #007aff;
  border-radius: 6px;
  align-items: center;
`;

const SaveButtonText = styled(Text)`
  font-size: 13px;
  font-weight: 600;
  color: #fff;
`;

const RouteRegionSection = styled(View)`
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
`;

const RouteRegionHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const RouteRegionTitle = styled(Text)`
  font-size: 13px;
  font-weight: 600;
  color: #333;
`;

const AddRegionButton = styled(TouchableOpacity)`
  padding: 4px 8px;
  background-color: #007aff;
  border-radius: 4px;
`;

const AddRegionButtonText = styled(Text)`
  font-size: 11px;
  font-weight: 600;
  color: #fff;
`;

const RegionListItem = styled(View)`
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 6px;
`;

const RegionListHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const RegionListInfo = styled(View)`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const RegionListIndex = styled(Text)`
  font-size: 13px;
  font-weight: 700;
  color: #007aff;
  width: 30px;
`;

const RegionListDetail = styled(Text)`
  font-size: 12px;
  color: #666;
`;

const RegionListActions = styled(View)`
  flex-direction: row;
  gap: 6px;
`;

const RegionEditButton = styled(TouchableOpacity)`
  padding: 4px 10px;
  background-color: #007aff;
  border-radius: 4px;
`;

const RegionEditButtonText = styled(Text)`
  font-size: 11px;
  font-weight: 600;
  color: #fff;
`;

const RegionDeleteButton = styled(TouchableOpacity)`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #dc3545;
  align-items: center;
  justify-content: center;
`;

const RegionDeleteButtonText = styled(Text)`
  color: #fff;
  font-size: 14px;
  font-weight: 700;
`;

const NoRegionsText = styled(Text)`
  font-size: 12px;
  color: #999;
  font-style: italic;
`;

const RegionImageList = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const RegionImageThumb = styled(Image)`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background-color: #e0e0e0;
`;

// NearbyPlacesSection 편집 스타일
const NearbyPlacesEditPanel = styled(View)`
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e0e0e0;
`;

const FieldGroup = styled(View)`
  margin-bottom: 16px;
`;

const FieldLabel = styled(Text)`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 6px;
`;

const FieldInput = styled(TextInput)`
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 14px;
  color: #333;
`;

const ImagePreviewContainer = styled(View)`
  position: relative;
  width: 100%;
`;

const ImagePreview = styled(Image)`
  width: 100%;
  height: 120px;
  border-radius: 6px;
  background-color: #f0f0f0;
`;

const ImageRemoveButton = styled(TouchableOpacity)`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #dc3545;
  align-items: center;
  justify-content: center;
`;

const ImageRemoveButtonText = styled(Text)`
  color: #fff;
  font-size: 16px;
  font-weight: 700;
`;

const DeleteSectionButton = styled(TouchableOpacity)`
  margin-top: 8px;
  padding: 10px;
  background-color: #dc3545;
  border-radius: 6px;
  align-items: center;
`;

const DeleteSectionButtonText = styled(Text)`
  font-size: 13px;
  font-weight: 600;
  color: #fff;
`;

// Route HTML 편집 스타일
const RouteHtmlEditPanel = styled(View)`
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #e0e0e0;
`;

const RouteHtmlHeader = styled(View)`
  margin-bottom: 8px;
`;

const RouteHtmlTitle = styled(Text)`
  font-size: 13px;
  font-weight: 600;
  color: #333;
`;

const HtmlTextArea = styled(TextInput)`
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px 12px;
  min-height: 150px;
  font-size: 12px;
  font-family: monospace;
  color: #333;
  text-align-vertical: top;
`;

// SeatViewSection 편집 스타일
const SeatViewEditPanel = styled(View)`
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e0e0e0;
`;

const RegionInfoText = styled(Text)`
  font-size: 11px;
  color: #666;
  margin-top: 8px;
  font-style: italic;
`;

const HtmlEditRow = styled(View)`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 8px;
`;

const HtmlTextAreaSmall = styled(TextInput)`
  flex: 1;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 10px;
  min-height: 80px;
  font-size: 11px;
  font-family: monospace;
  color: #333;
  text-align-vertical: top;
`;

const HtmlRemoveButton = styled(TouchableOpacity)`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #dc3545;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
`;

const HtmlRemoveButtonText = styled(Text)`
  color: #fff;
  font-size: 14px;
  font-weight: 700;
`;

const AddHtmlButton = styled(TouchableOpacity)`
  padding: 8px 12px;
  background-color: #007aff;
  border-radius: 6px;
  align-items: center;
  margin-top: 4px;
`;

const AddHtmlButtonText = styled(Text)`
  font-size: 12px;
  font-weight: 600;
  color: #fff;
`;

const SeatViewRegionHeader = styled(View)`
  margin-bottom: 8px;
`;

const HeaderEditPanel = styled(View)`
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e0e0e0;
`;

const OgImagePreview = styled(View)`
  margin-top: 8px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f0f0f0;
`;

const OgImagePreviewImg = styled(Image)`
  width: 100%;
  height: 100px;
`;
