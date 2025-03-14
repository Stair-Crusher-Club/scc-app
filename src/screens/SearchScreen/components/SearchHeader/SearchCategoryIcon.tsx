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
import {color} from '@/constant/color';

export const Icons = {
  CAFE: [CafeIcon, CafeOnIcon],
  CONVENIENCE_STORE: [ConvenienceIcon, ConvenienceOnIcon],
  RESTAURANT: [RestaurantIcon, RestaurantOnIcon],
  HOISPITAL: [HospitalIcon, HospitalOnIcon],
  PHARMACY: [PharmacyIcon, PharmacyOnIcon],
};

export default function SearchCategoryIcon({icon}: {icon: keyof typeof Icons}) {
  return <>{React.createElement(Icons[icon][0], {pointColor: color.gray90})}</>;
}
