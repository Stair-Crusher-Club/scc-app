export const logDebug = (...args: any[]) => {
  if (__DEV__) {
    console.log(...args);
  }
};
