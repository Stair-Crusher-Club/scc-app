import React, {useState, useCallback, useEffect} from 'react';
import styled from 'styled-components';
import {StackNavigationProp} from '@react-navigation/stack';
import {WebStackParamList} from '../navigation/WebNavigation';
import NLSearchInput from './NLSearchInput';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: StackNavigationProp<WebStackParamList>;
  initialQuery?: string;
}

export default function SearchModal({
  isOpen,
  onClose,
  navigation,
  initialQuery = '',
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Set initial query when opening modal
      setSearchQuery(initialQuery);
    }
  }, [isOpen, initialQuery]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', {query: searchQuery.trim()});
      onClose();
      setSearchQuery('');
    }
  }, [searchQuery, navigation, onClose]);

  const handleExampleClick = useCallback(
    (example: string) => {
      navigation.navigate('Search', {query: example});
      onClose();
      setSearchQuery('');
    },
    [navigation, onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    <ModalBackdrop onClick={handleBackdropClick} onKeyDown={handleKeyDown}>
      <ModalContainer>
        <ModalContent>
          <NLSearchInput
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleSearch}
            onExampleClick={handleExampleClick}
            autoFocus={true}
            showExamples={true}
            showShortcuts={true}
          />
        </ModalContent>
      </ModalContainer>
    </ModalBackdrop>
  );
}

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 600px;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalContent = styled.div`
  padding: 30px;
`;
