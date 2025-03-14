export const colorOfScore = (score?: number) => {
  if (score === undefined) {
    return '#B5B5C0';
  } else if (score >= 4.0) {
    return '#D32A27';
  } else if (score >= 2.0) {
    return '#F5AB1C';
  } else if (score >= 1.0) {
    return '#58C478';
  } else {
    return '#1B8466';
  }
};
