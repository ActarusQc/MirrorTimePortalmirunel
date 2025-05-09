export interface Interpretation {
  type: string;
  spiritual: {
    title: string;
    description: string;
    guidance: string;
  };
  angel: {
    name: string;
    message: string;
    guidance: string;
  };
  numerology: {
    title: string;
    rootNumber: string;
    mirrorEffect: string;
    analysis: string;
  };
}

export function isMirrorHour(time: string): boolean {
  const [hours, minutes] = time.split(':');
  return hours === minutes;
}

export function isReversedHour(time: string): boolean {
  const [hours, minutes] = time.split(':');
  return hours === minutes.split('').reverse().join('');
}

export function getTimeType(time: string): string {
  if (isMirrorHour(time)) return "Mirror Hour";
  if (isReversedHour(time)) return "Reversed Hour";
  return "Regular Hour";
}

export function calculateRootNumber(time: string): number {
  // Remove the colon and sum all digits
  const digits = time.replace(':', '').split('').map(Number);
  const sum = digits.reduce((acc, digit) => acc + digit, 0);
  
  // If sum is greater than 9, reduce to a single digit
  if (sum > 9) {
    return calculateRootNumber(sum.toString());
  }
  
  return sum;
}
