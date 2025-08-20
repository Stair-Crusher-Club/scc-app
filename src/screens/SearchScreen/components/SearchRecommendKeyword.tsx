import {useQuery} from '@tanstack/react-query';
import {View} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {SearchPlacePresetDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';

export default function SearchRecommendKeyword({
  onPressKeyword: onClickSearch,
}: {
  onPressKeyword: (search: string) => void;
}) {
  const {api} = useAppComponents();

  const {data} = useQuery<SearchPlacePresetDto[]>({
    queryKey: ['ListSearchPlacePresets'],
    queryFn: async () =>
      (await api.listSearchPlacePresetsPost({}))?.data?.keywordPresets,
  });

  if (!data?.length) {
    return null;
  }

  return (
    <View style={{gap: 12}}>
      <TitleText>추천 키워드</TitleText>
      <ItemList>
        {data?.map(({id, searchText, description}) => (
          <TouchableItemBox key={id} onPress={() => onClickSearch(searchText)}>
            <ItemText numberOfLines={1}>{description}</ItemText>
          </TouchableItemBox>
        ))}
      </ItemList>
    </View>
  );
}

export const ItemList = styled.View({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 6,
});

export const TitleText = styled.Text({
  fontSize: 14,
  fontFamily: font.pretendardBold,
  color: '#121a27',
});

export const TouchableItemBox = styled.TouchableOpacity({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: '#f3f4fa',
  borderRadius: 100,
  padding: '7px 12px',
  backgroundColor: '#f3f4fa',
  height: 36,
});

export const ItemText = styled.Text({
  fontSize: 15,
  fontFamily: font.pretendardRegular,
  color: color.black,
});
