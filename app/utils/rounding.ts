export function smartRound(value: number | string): number | string {
  const num = Number(value);
  if (isNaN(num))
    return 0;

  // Check if value is > 1 or is a whole number
  if (num > 1 || num % 1 === 0) {
    return Math.round(num);
  }
  // For small decimal numbers, use toFixed(1)
  return num.toFixed(1);
}
