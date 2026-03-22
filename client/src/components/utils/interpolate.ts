export function interpolateArray<T extends Record<string, any>>(arr: T[], newLength: number): T[] {
  if (arr.length === newLength || arr.length === 0) return arr;
  const result: T[] = [];
  for (let i = 0; i < newLength; i++) {
    const pos = (i / (newLength - 1)) * (arr.length - 1);
    const idx = Math.floor(pos);
    const frac = pos - idx;
    if (idx + 1 < arr.length) {
      const a = arr[idx];
      const b = arr[idx + 1];
      const interpolated: any = {};
      for (const key in a) {
        if (typeof a[key] === 'number' && typeof b[key] === 'number') {
          interpolated[key] = a[key] * (1 - frac) + b[key] * frac;
        } else {
          interpolated[key] = a[key]; // Copy non-numeric fields
        }
      }
      result.push(interpolated);
    } else {
      result.push(arr[idx]);
    }
  }
  return result;
}