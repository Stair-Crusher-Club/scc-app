import {FormProvider, useForm} from 'react-hook-form';

import {EntranceDoorType, Place} from '@/generated-sources/openapi';
import ImageFile from '@/models/ImageFile';

import PlaceInfoSection from '../sections/PlaceInfoSection';
import ToiletSection from '../sections/ToiletSection';
import {SectionSeparator} from '../sections/common.style';

interface ToiletReviewViewProps {
  place?: Place;
  gotoPlaceDetail: () => void;
}

interface FormValues {
  exist: string;
  exactFloor: number;
  doorTypes: EntranceDoorType[];
  toiletPhotos: ImageFile[];
  experience: string;
}

export default function ToiletReviewView({
  place,
  gotoPlaceDetail,
}: ToiletReviewViewProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      exist: '',
      exactFloor: 1,
      doorTypes: [],
      toiletPhotos: [],
      experience: '',
    },
  });

  return (
    <FormProvider {...form}>
      <PlaceInfoSection name={place?.name} address={place?.address} />
      <SectionSeparator />
      <ToiletSection onSave={gotoPlaceDetail} />
    </FormProvider>
  );
}
