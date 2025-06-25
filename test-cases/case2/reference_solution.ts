export function sumArray(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0;
  }
  return numbers.reduce((sum, current) => sum + current, 0);
}
