import React from 'react';

import CafeIcon from '@/assets/icon/ic_cafe.svg';
import CafeOnIcon from '@/assets/icon/ic_cafe_on.svg';
import ConvenienceIcon from '@/assets/icon/ic_convenience.svg';
import ConvenienceOnIcon from '@/assets/icon/ic_convenience_on.svg';
import HospitalIcon from '@/assets/icon/ic_hospital.svg';
import HospitalOnIcon from '@/assets/icon/ic_hospital_on.svg';
import PharmacyIcon from '@/assets/icon/ic_pharmacy.svg';
import PharmacyOnIcon from '@/assets/icon/ic_pharmacy_on.svg';
import RestaurantIcon from '@/assets/icon/ic_restaurant.svg';
import RestaurantOnIcon from '@/assets/icon/ic_restaurant_on.svg';
import ToiletIcon from '@/assets/icon/ic_toilet.svg';
import {color as colors} from '@/constant/color';

export const Icons = {
  TOILET: [ToiletIcon, ToiletIcon],
  CAFE: [CafeIcon, CafeOnIcon],
  CONVENIENCE_STORE: [ConvenienceIcon, ConvenienceOnIcon],
  RESTAURANT: [RestaurantIcon, RestaurantOnIcon],
  HOISPITAL: [HospitalIcon, HospitalOnIcon],
  PHARMACY: [PharmacyIcon, PharmacyOnIcon],
};

interface SearchCategoryIconProps {
  icon: keyof typeof Icons;
  color?: string;
  size?: number;
  isOn?: boolean;
}

export default function SearchCategoryIcon({
  icon,
  color,
  size = 18,
  isOn = false,
}: SearchCategoryIconProps) {
  return (
    <>
      {React.createElement(isOn ? Icons[icon][1] : Icons[icon][0], {
        color: color ?? colors.gray90,
        width: size,
        height: size,
      })}
    </>
  );
}
