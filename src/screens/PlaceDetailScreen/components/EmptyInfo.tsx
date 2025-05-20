import * as S from './PlaceInfo.style';

export default function EmptyInfo({type}: {type: string}) {
  if (!type) {
    return null;
  }

  return (
    <S.EmptyInfoContainer>
      <S.EmptyType>{type}</S.EmptyType>
      <S.EmptyDescription>등록된 정보가 없습니다.</S.EmptyDescription>
    </S.EmptyInfoContainer>
  );
}
