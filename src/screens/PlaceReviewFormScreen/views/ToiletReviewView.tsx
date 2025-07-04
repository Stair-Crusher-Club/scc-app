import {FormProvider, useForm} from 'react-hook-form';

import {Place} from '@/generated-sources/openapi';

import PlaceInfoSection from '../sections/PlaceInfoSection';
import {SectionSeparator} from '../sections/common.style';

interface ToiletReviewViewProps {
  place?: Place;
  gotoPlaceDetail: () => void;
}

interface FormValues {}

export default function ToiletReviewView({
  place,
  gotoPlaceDetail,
}: ToiletReviewViewProps) {
  const form = useForm<FormValues>({
    defaultValues: {},
  });

  return (
    <FormProvider {...form}>
      <PlaceInfoSection name={place?.name} address={place?.address} />
      <SectionSeparator />
    </FormProvider>
  );
}
