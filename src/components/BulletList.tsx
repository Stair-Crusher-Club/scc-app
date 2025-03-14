import React from 'react';
import {Text} from 'react-native';

import * as S from './BulletList.style';

export default function BulletList({children}: React.PropsWithChildren<{}>) {
  return (
    <S.Column>
      <S.Row>
        <S.Bullet>
          <Text>{'\u2022'}</Text>
        </S.Bullet>
        <S.BulletText>{children}</S.BulletText>
      </S.Row>
    </S.Column>
  );
}
