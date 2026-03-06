import React, {useMemo} from 'react';
import styled from 'styled-components/native';

import {
  BuildingAccessibilityComment,
  PlaceAccessibilityComment,
} from '@/generated-sources/openapi';

import {FieldCommentBox, StrokeCTAButton} from './AccessibilityInfoComponents';

type CommentType = PlaceAccessibilityComment | BuildingAccessibilityComment;

interface AccessibilityCommentSectionProps {
  comments: CommentType[];
  buttonText: string;
  onAddComment?: () => void;
  elementName: string;
  /** 등록 시 작성된 코멘트 텍스트 — 중복 표시 방지를 위해 제외 */
  registrationComments?: string[];
}

export default function AccessibilityCommentSection({
  comments,
  buttonText,
  onAddComment,
  elementName,
  registrationComments,
}: AccessibilityCommentSectionProps) {
  const sortedComments = useMemo(() => {
    const excludeSet = new Set(registrationComments ?? []);
    return [...comments]
      .filter(c => !excludeSet.has(c.comment))
      .sort((a, b) => b.createdAt.value - a.createdAt.value);
  }, [comments, registrationComments]);

  if (sortedComments.length === 0 && !onAddComment) {
    return null;
  }

  return (
    <Container>
      {sortedComments.map((c, index) => (
        <FieldCommentBox
          key={c.id ?? index}
          comment={c.comment}
          userName={c.user?.nickname ?? '익명 비밀요원'}
          createdAt={c.createdAt}
        />
      ))}
      <StrokeCTAButton
        text={buttonText}
        onPress={onAddComment}
        elementName={elementName}
      />
    </Container>
  );
}

const Container = styled.View`
  gap: 12px;
  padding-bottom: 20px;
`;
