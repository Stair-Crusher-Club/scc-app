module.exports = {
  preset: 'react-native',
  // react-native preset 은 moduleFileExtensions 를 정의하지 않는다. jest 기본값과 달리
  // ts/tsx 를 js 보다 앞에 둬야 같은 이름의 .ts/.js 가 있을 때 ts 가 먼저 잡힌다.
  // (원래 package.json 의 `jest` 키에 있었는데, 설정 파일이 둘이면 jest 가 실행을 거부한다)
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
