import React from 'react';
import styled from 'styled-components';

interface NLSearchInputProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  onExampleClick: (example: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showExamples?: boolean;
  showShortcuts?: boolean;
}

const exampleQueries = [
  '휠체어로 갈 수 있는 카페',
  '계단 2칸 이하의 음식점',
  '접근성이 좋은 병원',
  '엘리베이터가 있는 도서관',
  '경사로가 있는 박물관',
];

export default function NLSearchInput({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  onExampleClick,
  placeholder = '당신은 어떤 분이고, 어디로 가고 싶나요?\n\n예: 나는 휠체어를 타고 계단 1칸 정도는 올라갈 수 있어. 홍대 근처 맛집 좀 찾아줄래?',
  autoFocus = false,
  showExamples = true,
  showShortcuts = true,
}: NLSearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      onSearch();
    }
    // Shift+Enter allows new line
  };

  return (
    <>
      <SearchInputWrapper>
        <StyledSearchTextarea
          value={searchQuery}
          onChange={e => onSearchQueryChange((e.target as HTMLTextAreaElement).value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
        <SearchButton onClick={onSearch} disabled={!searchQuery.trim()}>
          🔍
        </SearchButton>
      </SearchInputWrapper>

      {showExamples && (
        <ExamplesSection>
          {exampleQueries.map((example, index) => (
            <ExampleChip key={index} onClick={() => onExampleClick(example)}>
              {example}
            </ExampleChip>
          ))}
        </ExamplesSection>
      )}

      {showShortcuts && (
        <ShortcutHint>
          <span>ESC</span> 닫기
          <Separator>·</Separator>
          <span>Enter</span> 검색
          <Separator>·</Separator>
          <span>⌘K / Ctrl+K</span> 열기
        </ShortcutHint>
      )}
    </>
  );
}

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #f5f7fa;
  border-radius: 16px;
  transition: all 0.3s ease;

  &:focus-within {
    background: #e8f0fe;
    box-shadow: 0 0 0 2px #3498db;
  }
`;

const StyledSearchTextarea = styled.textarea`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 18px;
  outline: none;
  color: #2c3e50;
  resize: none;
  min-height: 100px;
  font-family: inherit;
  padding: 0;
  line-height: 1.4;

  &::placeholder {
    color: #95a5a6;
    font-size: 14px;
    line-height: 1.6;
  }
`;

const SearchButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: #3498db;
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #2980b9;
    transform: scale(1.05);
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }
`;

const ExamplesSection = styled.div`
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const ExampleChip = styled.button`
  padding: 10px 16px;
  background: #ecf0f1;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: #34495e;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #3498db;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(52, 152, 219, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ShortcutHint = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
  text-align: center;
  font-size: 13px;
  color: #7f8c8d;

  span {
    background: #ecf0f1;
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 600;
    color: #34495e;
  }
`;

const Separator = styled.span`
  margin: 0 10px;
  color: #bdc3c7;
`;
