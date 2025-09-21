import React, {useState, useCallback} from 'react';
import styled from 'styled-components';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {WebStackParamList} from '../navigation/WebNavigation';
import NLSearchInput from '../components/NLSearchInput';

type WebHomeScreenProps = {
  route: RouteProp<WebStackParamList, 'Home'>;
  navigation: StackNavigationProp<WebStackParamList>;
};

export default function WebHomeScreen({navigation}: WebHomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', {query: searchQuery.trim()});
    }
  }, [searchQuery, navigation]);

  const handleExampleClick = useCallback(
    (example: string) => {
      navigation.navigate('Search', {query: example});
    },
    [navigation],
  );

  return (
    <Container>
      <ContentWrapper>
        <LogoSection>
          <Logo>계단뿌셔클럽</Logo>
          <Subtitle>이동약자와 그 친구들의 막힘없는 이동 🚀</Subtitle>
        </LogoSection>

        <SearchSection>
          <SearchWrapper>
            <NLSearchInput
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onSearch={handleSearch}
              onExampleClick={handleExampleClick}
              autoFocus={false}
              showExamples={true}
              showShortcuts={false}
            />
          </SearchWrapper>
        </SearchSection>
      </ContentWrapper>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 600px;
  text-align: center;
`;

const LogoSection = styled.div`
  margin-bottom: 60px;
`;

const Logo = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #7f8c8d;
  margin: 0;
  font-weight: 300;
`;

const SearchSection = styled.div`
  margin-bottom: 50px;
`;

const SearchWrapper = styled.div`
  position: relative;
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  &:focus-within {
    box-shadow: 0 12px 40px rgba(52, 152, 219, 0.2);
  }
`;
