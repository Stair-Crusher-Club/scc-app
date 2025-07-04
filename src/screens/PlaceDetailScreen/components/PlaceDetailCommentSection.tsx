import React from 'react';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import {CommentBlock} from '@/components/molecules';
import {color} from '@/constant/color';
import {
  BuildingAccessibilityComment,
  PlaceAccessibilityComment,
} from '@/generated-sources/openapi';
import {LogClick} from '@/logging/LogClick';

import * as S from '../sections/PlaceDetailEntranceSection.style';

interface PlaceDetailCommentSectionProps {
  comments: BuildingAccessibilityComment[] | PlaceAccessibilityComment[];
  onAddComment: () => void;
  checkAuth: (cb: () => void) => void;
  title: string;
}

export default function PlaceDetailCommentSection({
  comments,
  onAddComment,
  checkAuth,
  title,
}: PlaceDetailCommentSectionProps) {
  return (
    <S.Comments>
      {comments.map(comment => (
        <CommentBlock key={comment.id} info={comment} />
      ))}
      <LogClick elementName="place_detail_add_comment_button">
        <S.AddCommentButton onPress={() => checkAuth(onAddComment)}>
          <PlusIcon width={12} height={12} color={color.blue50} />
          <S.AddCommentText>{title}</S.AddCommentText>
        </S.AddCommentButton>
      </LogClick>
    </S.Comments>
  );
}
