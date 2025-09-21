import React, {useState, useCallback, useRef, useEffect} from 'react';
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
  '계단 2칸 이하의 맛집',
  '엘리베이터가 있는 병원',
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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // 컴포넌트 언마운트 시 음성 인식 중지
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // 이미 중지되었을 수 있음
        }
        setIsListening(false);
      }
    };
  }, []);

  // 음성 인식 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // 연속 인식 활성화
      recognitionRef.current.interimResults = true; // 실시간 결과 활성화
      recognitionRef.current.lang = 'ko-KR';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        // 모든 결과를 순회하면서 최종/임시 텍스트 분리
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // 최종 결과 + 임시 결과를 합쳐서 실시간 업데이트
        const fullTranscript = finalTranscript + interimTranscript;
        onSearchQueryChange(fullTranscript);

        // 연속 모드이므로 자동 종료하지 않음 - 사용자가 수동으로 중지해야 함
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log('Recognition cleanup');
        }
      }
    };
  }, [onSearchQueryChange]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Already stopped');
      }
      setIsListening(false);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      onSearch();
    }
    // Shift+Enter allows new line
  };

  const isSpeechRecognitionSupported = typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in (window as any) || 'SpeechRecognition' in (window as any));

  return (
    <>
      <SearchInputWrapper>
        <StyledSearchTextarea
          value={searchQuery}
          onChange={e => onSearchQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? '음성을 듣고 있습니다...' : placeholder}
          autoFocus={autoFocus}
          disabled={isListening}
        />
        <ButtonGroup>
          {isSpeechRecognitionSupported && (
            <VoiceButtonContainer>
              <VoiceButton
                onClick={isListening ? stopListening : startListening}
                isListening={isListening}
                title={isListening ? '음성 인식 중지' : '음성으로 검색'}
              >
                {isListening ? '🔴' : '🎙️'}
              </VoiceButton>
              {isListening ? (
                <VoiceTooltip>
                  🔴 버튼을 눌러 중지하세요
                </VoiceTooltip>
              ) : (
                <VoiceTooltip>
                  🎙️ 음성으로 검색해보세요
                </VoiceTooltip>
              )}
            </VoiceButtonContainer>
          )}
          <SearchButton onClick={onSearch} disabled={!searchQuery.trim()}>
            🔍
          </SearchButton>
        </ButtonGroup>
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
          {isSpeechRecognitionSupported && (
            <>
              <Separator>·</Separator>
              <span>🎙️</span> 음성 검색
            </>
          )}
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const VoiceButtonContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
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

const VoiceButton = styled.button<{isListening: boolean}>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: ${props => props.isListening ? '#e74c3c' : '#27ae60'};
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: ${props => props.isListening ? '#c0392b' : '#229954'};
    transform: scale(1.05);
  }

  ${props => props.isListening && `
    animation: pulse 1.5s ease-in-out infinite;

    @keyframes pulse {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
      }
      70% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
      }
    }
  `}
`;

const VoiceTooltip = styled.div`
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000;
  animation: bounceUpDown 2s ease-in-out infinite;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.8);
  }

  @keyframes bounceUpDown {
    0%, 100% {
      transform: translateX(-50%) translateY(0);
    }
    50% {
      transform: translateX(-50%) translateY(-8px);
    }
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
