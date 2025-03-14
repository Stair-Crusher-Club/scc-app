import {debounce} from 'lodash';
import React, {useCallback, useEffect} from 'react';
import {TouchableOpacity} from 'react-native';
import {useRecoilState} from 'recoil';
import styled from 'styled-components/native';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import ClearIcon from '@/assets/icon/ic_clear.svg';
import ListIcon from '@/assets/icon/ic_list.svg';
import MapIcon from '@/assets/icon/ic_map.svg';
import SearchIcon from '@/assets/icon/ic_search.svg';
import {color} from '@/constant/color.ts';
import {font} from '@/constant/font.ts';
import useNavigation from '@/navigation/useNavigation.ts';

import {draftKeywordAtom, searchQueryAtom, viewStateAtom} from '../../atoms';

export default function SearchInputText({
  onTextUpdate,
  autoFocus,
}: {
  onTextUpdate: (text: string, isPreviewChange: boolean) => void;
  autoFocus?: boolean;
}) {
  const [draftKeyword, setDraftKeyword] = useRecoilState(draftKeywordAtom);
  const [searchQuery, _] = useRecoilState(searchQueryAtom);
  const navigation = useNavigation();
  const [viewState, setViewState] = useRecoilState(viewStateAtom);
  const debounceSearch = useCallback(
    debounce(
      (keyword: string) => {
        onTextUpdate(keyword, true);
      },
      300,
      {leading: false, trailing: true},
    ),
    [],
  );
  const isMap = viewState.type === 'map' && !viewState.inputMode;
  const onChange = (text: string) => {
    setDraftKeyword(text);
    debounceSearch(text);
  };
  const onClear = () => {
    setDraftKeyword(null);
    setViewState({type: 'map', inputMode: false});
    onTextUpdate('', false); // 미리보기가 아닌 경우 Input Mode 를 해제
  };
  const isTextExists = searchQuery.text?.length !== 0;

  useEffect(() => {
    if (searchQuery.text) {
      setDraftKeyword(null);
    }
  }, [searchQuery.text]);

  return (
    <Wrapper>
      {!viewState.inputMode && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (viewState.inputMode) {
              navigation.goBack();
            } else if (viewState.type === 'map') {
              setViewState({type: 'list', inputMode: false});
            } else {
              setViewState({type: 'map', inputMode: false});
            }
          }}>
          <MapListToggleButton>
            {isMap ? (
              <>
                <ListIcon width={20} height={20} />
                <MapListToggleText>목록</MapListToggleText>
              </>
            ) : (
              <>
                <MapIcon width={20} height={20} />
                <MapListToggleText>지도</MapListToggleText>
              </>
            )}
          </MapListToggleButton>
        </TouchableOpacity>
      )}
      <Container>
        <IconButton
          onPress={() => {
            navigation.goBack();
          }}
          activeOpacity={0.6}>
          <LeftArrowIcon width={16} height={14} color={color.gray100} />
        </IconButton>

        <Input
          style={{marginLeft: 8, marginRight: 12}}
          placeholder={'장소, 주소 검색'}
          placeholderTextColor={color.gray70}
          onChangeText={text => onChange(text)}
          onFocus={() =>
            setViewState(prev => {
              return {...prev, inputMode: true};
            })
          }
          value={draftKeyword ?? searchQuery.text ?? ''}
          returnKeyType="search"
          onSubmitEditing={() => {
            onTextUpdate(draftKeyword ?? searchQuery.text ?? '', false);
          }}
          autoFocus={autoFocus}
        />
        <IconButton
          onPress={() => {
            isTextExists
              ? onClear()
              : onTextUpdate(draftKeyword ?? searchQuery.text ?? '', false);
          }}
          activeOpacity={0.6}>
          {isTextExists ? (
            <ClearIcon width={20} height={20} />
          ) : (
            <SearchIcon color={color.gray100} width={14} height={14} />
          )}
        </IconButton>
      </Container>
    </Wrapper>
  );
}

const Wrapper = styled.View({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
  paddingLeft: 12,
  paddingRight: 12,
  gap: 12,
  height: 60,
});

const Input = styled.TextInput({
  flex: 1,
  color: color.black,
  fontFamily: font.pretendardMedium,
  fontSize: 16,
  paddingVertical: 0,
});

const MapListToggleButton = styled.View`
  display: flex;
  border-radius: 8px;
  width: 26px;
  height: 38px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
`;

const MapListToggleText = styled.Text({
  color: color.black,
  fontFamily: font.pretendardRegular,
  fontSize: 12,
});

const Container = styled.View`
  shadow-offset: 0px 3px;
  shadow-radius: 5px;
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 8px;
  background-color: ${color.gray10};
  padding-horizontal: 12px;
  height: 44px;
  padding-vertical: 0;
`;

const IconButton = styled.TouchableOpacity`
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
`;
