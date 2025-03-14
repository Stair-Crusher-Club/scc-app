export function parseOrNull(json: string): any {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}
