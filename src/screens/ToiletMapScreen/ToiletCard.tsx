import {useAtomValue} from 'jotai';
import {SccPressable} from '@/components/SccPressable';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import React from 'react';
import styled from 'styled-components/native';

import BookmarkIcon from '@/assets/icon/ic_bookmark.svg';
import ShareIcon from '@/assets/icon/ic_share.svg';
import {currentLocationAtom} from '@/atoms/Location';
import Tags from '@/components/Tag';
import {MarkerItem} from '@/components/maps/MarkerItem.ts';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import useNavigation from '@/navigation/useNavigation';
import AvailableLabel from '@/screens/ExternalAccessibilityDetailScreen/AvailableLabel';
import ImageList from '@/screens/PlaceDetailScreen/components/PlaceDetailImageList';
import {ToiletDetails} from '@/screens/ToiletMapScreen/data';
import {distanceInMeter, prettyFormatMeter} from '@/utils/DistanceUtils';
import ToastUtils from '@/utils/ToastUtils.ts';

export default function ToiletCard({item}: {item: ToiletDetails & MarkerItem}) {
  const navigation = useNavigation();
  const currentLocation = useAtomValue(currentLocationAtom);
  const distanceText = (() => {
    let distance;
    if (currentLocation && item.location) {
      distance = distanceInMeter(currentLocation, {
        latitude: item.location.lat,
        longitude: item.location.lng,
      });
    } else {
      distance = undefined;
    }
    return prettyFormatMeter(distance);
  })();
  const images = item.imageUrl ? [{imageUrl: item.imageUrl}] : [];
  const onShare = () => {
    ToastUtils.show('준비 중입니다.');
  };
  const onBookmark = () => {
    ToastUtils.show('준비 중입니다.');
  };
  const tagTexts: string[] = [item.gender?.desc, item.entrance?.desc].filter(
    Boolean,
  ) as string[];

  return (
    <Container
      elementName="toilet_card"
      onPress={() => {
        navigation.navigate('ExternalAccessibilityDetail', {
          externalAccessibilityId: item.id,
        });
      }}>
      <InfoArea>
        <LabelIconArea>
          <AvailableLabel
            availableState={item.available?.state ?? 'UNKNOWN'}
            text={item.available?.desc ?? '알수없음'}
          />
          <IconArea>
            <SccTouchableOpacity
              elementName="toilet_card_share_button"
              activeOpacity={0.6}
              onPress={onShare}>
              <ShareIcon color={color.gray80} />
            </SccTouchableOpacity>
            <SccTouchableOpacity
              elementName="toilet_card_bookmark_button"
              activeOpacity={0.6}
              onPress={onBookmark}>
              <BookmarkIcon color={color.gray80} />
            </SccTouchableOpacity>
          </IconArea>
        </LabelIconArea>
        <TitleArea>
          <TitleText>{item.name}</TitleText>
          <LocationBox>
            <DistanceText>{distanceText}</DistanceText>
            <LocationDivider />
            <AddressText>{item.address}</AddressText>
          </LocationBox>
        </TitleArea>
        <ExtraArea>
          <Tags texts={tagTexts} />
        </ExtraArea>
      </InfoArea>
      <ImageList images={images} />
    </Container>
  );
}

const InfoArea = styled.View`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const LabelIconArea = styled.View`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const TitleArea = styled.View`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 8px;
`;

const ExtraArea = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
`;

const IconArea = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const Container = styled(SccPressable)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  height: 230px;
`;
const TitleText = styled.Text`
  font-size: 16px;
  font-family: ${() => font.pretendardBold};
  color: ${() => color.black};
`;

const DistanceText = styled.Text`
  font-size: 14px;
  font-family: ${() => font.pretendardMedium};
  color: ${() => color.gray80};
`;

const AddressText = styled.Text`
  font-size: 14px;
  font-family: ${() => font.pretendardRegular};
  color: ${() => color.gray80};
`;

const LocationBox = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
`;

const LocationDivider = styled.View`
  width: 2px;
  height: 2px;
  border-radius: 1px;
  background-color: ${() => color.gray80};
`;
