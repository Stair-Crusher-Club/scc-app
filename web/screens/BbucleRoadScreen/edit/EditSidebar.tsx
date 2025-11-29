import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import styled from 'styled-components/native';

import { useEditMode } from '../context/EditModeContext';

export default function EditSidebar() {
  const editContext = useEditMode();
  const [jsonInput, setJsonInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!editContext) return null;

  const { data, exportToJson, importFromJson, canUndo, undo } = editContext;

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

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

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

          {/* Undo */}
          <Section>
            <SectionTitle>실행 취소</SectionTitle>
            <ActionButton
              onPress={handleUndo}
              disabled={!canUndo}
              style={{ opacity: canUndo ? 1 : 0.5 }}
            >
              <ActionButtonText>⌘Z Undo</ActionButtonText>
            </ActionButton>
          </Section>

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
            <HelpText>• ⌘Z: 실행 취소</HelpText>
            <HelpText>• Polygon 편집 중 ⌘Z: 점 취소</HelpText>
          </Section>
        </SidebarContent>
      </ScrollView>
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
