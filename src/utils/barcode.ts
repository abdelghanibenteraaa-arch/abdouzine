/**
 * Barcode Utility for Algerian EAN-13 and Code-128 generation
 * Prefix 613 is the official GS1 country code for Algeria (الجمهورية الجزائرية)
 */

// Calculate EAN-13 check digit
export function calculateEan13Checksum(digits12: string): number {
  const digits = digits12.replace(/\D/g, '').padEnd(12, '0').slice(0, 12).split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += i % 2 === 0 ? digits[i] : digits[i] * 3;
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

// Generate a valid 13-digit Algerian barcode (starts with 613)
export function generateAlgerianBarcode(): string {
  const random9 = Math.floor(100000000 + Math.random() * 900000000).toString();
  const base12 = `613${random9}`;
  const checksum = calculateEan13Checksum(base12);
  return `${base12}${checksum}`;
}

// EAN-13 Encoding tables
const L_CODE = [
  '0001101', '0011001', '0010011', '0111101', '0100011',
  '0110001', '0101111', '0111011', '0110111', '0001011'
];
const G_CODE = [
  '0100111', '0110011', '0011011', '0100001', '0011101',
  '0111001', '0000101', '0010001', '0001001', '0010111'
];
const R_CODE = [
  '1110010', '1100110', '1101100', '1000010', '1011100',
  '1001110', '1010000', '1000100', '1001000', '1110100'
];

const FIRST_DIGIT_STRUCTURE = [
  ['L', 'L', 'L', 'L', 'L', 'L'], // 0
  ['L', 'L', 'G', 'L', 'G', 'G'], // 1
  ['L', 'L', 'G', 'G', 'L', 'G'], // 2
  ['L', 'L', 'G', 'G', 'G', 'L'], // 3
  ['L', 'G', 'L', 'L', 'G', 'G'], // 4
  ['L', 'G', 'G', 'L', 'L', 'G'], // 5
  ['L', 'G', 'G', 'G', 'L', 'L'], // 6
  ['L', 'G', 'L', 'G', 'L', 'G'], // 7
  ['L', 'G', 'L', 'G', 'G', 'L'], // 8
  ['L', 'G', 'G', 'L', 'G', 'L'], // 9
];

/**
 * Generate binary bitstring pattern ('1' for black bar, '0' for white space) for EAN-13
 */
export function getEan13BitPattern(code: string): string | null {
  const digits = code.replace(/\D/g, '');
  if (digits.length !== 13) return null;

  const firstDigit = Number(digits[0]);
  const leftDigits = digits.slice(1, 7).split('').map(Number);
  const rightDigits = digits.slice(7, 13).split('').map(Number);

  const structure = FIRST_DIGIT_STRUCTURE[firstDigit];
  if (!structure) return null;

  let pattern = '101'; // Left guard

  // Left 6 digits
  for (let i = 0; i < 6; i++) {
    const digit = leftDigits[i];
    const encodingType = structure[i];
    pattern += encodingType === 'L' ? L_CODE[digit] : G_CODE[digit];
  }

  pattern += '01010'; // Center guard

  // Right 6 digits
  for (let i = 0; i < 6; i++) {
    const digit = rightDigits[i];
    pattern += R_CODE[digit];
  }

  pattern += '101'; // Right guard

  return pattern;
}

/**
 * Convert arbitrary text or SKU to simple Code 128-like alternating bars for visual rendering
 */
export function getGenericBarPattern(text: string): string {
  // If it's 13 digits, try EAN-13 first
  if (/^\d{13}$/.test(text)) {
    const eanPattern = getEan13BitPattern(text);
    if (eanPattern) return eanPattern;
  }

  // Fallback high-density alternating bar pattern
  let pattern = '11010010000'; // Start B
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) % 10;
    pattern += L_CODE[charCode] || '1010100';
  }
  pattern += '1100011101011'; // Stop
  return pattern;
}
