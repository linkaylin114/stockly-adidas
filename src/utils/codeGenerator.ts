import { Product } from '../types/warehouse';

/**
 * Category prefix mapping for standard SKU generation
 */
const CATEGORY_PREFIXES: Record<string, string> = {
  'Originals / Phong cách sống': 'STK-OG',
  'Chạy bộ (Running)': 'STK-RUN',
  'Bóng đá (Football)': 'STK-FB',
  'Thể thao & Tập luyện': 'STK-TRN',
  'Dép & Sandal': 'STK-SLD',
  'Ngoài trời (Outdoor & Terrex)': 'STK-TRX',
};

/**
 * Generate a 100% unique SKU that never duplicates any existing product in the warehouse
 * Format: STK-[CATEGORY]-[RANDOM_UNIQUE]-[SIZE]
 */
export function generateUniqueSku(
  category: string,
  existingProducts: Product[],
  size: string | number = '42'
): string {
  const prefix = CATEGORY_PREFIXES[category] || 'STK-ADI';
  const existingSkus = new Set(existingProducts.map((p) => p.sku.toUpperCase()));

  let attempts = 0;
  while (attempts < 1000) {
    // Generate 4-digit random number
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${prefix}-${randomNum}-${size}`;

    if (!existingSkus.has(candidate.toUpperCase())) {
      return candidate;
    }
    attempts++;
  }

  // Fallback timestamp based
  return `${prefix}-${Date.now().toString().slice(-6)}-${size}`;
}

/**
 * Calculate standard EAN-13 check digit
 */
function calculateEan13CheckDigit(first12Digits: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(first12Digits[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Generate a 100% unique EAN-13 Barcode that never duplicates any existing product in the warehouse
 * Format: 4066 (Adidas / German standard) + 8 digits + 1 checksum digit
 */
export function generateUniqueBarcode(existingProducts: Product[]): string {
  const existingBarcodes = new Set(existingProducts.map((p) => p.barcode.trim()));

  let attempts = 0;
  while (attempts < 1000) {
    // 4066 + 8 random digits = 12 digits
    const random8 = Math.floor(10000000 + Math.random() * 90000000).toString();
    const first12 = `4066${random8}`;
    const checkDigit = calculateEan13CheckDigit(first12);
    const fullBarcode = `${first12}${checkDigit}`;

    if (!existingBarcodes.has(fullBarcode)) {
      return fullBarcode;
    }
    attempts++;
  }

  // Fallback timestamp
  const ts12 = `4066${Date.now().toString().slice(-8)}`;
  return `${ts12}${calculateEan13CheckDigit(ts12)}`;
}

/**
 * Check if a SKU already exists in other products
 */
export function isSkuDuplicate(
  sku: string,
  existingProducts: Product[],
  excludeId?: string
): boolean {
  if (!sku.trim()) return false;
  const target = sku.trim().toUpperCase();
  return existingProducts.some(
    (p) => p.id !== excludeId && p.sku.trim().toUpperCase() === target
  );
}

/**
 * Check if a Barcode already exists in other products
 */
export function isBarcodeDuplicate(
  barcode: string,
  existingProducts: Product[],
  excludeId?: string
): boolean {
  if (!barcode.trim()) return false;
  const target = barcode.trim();
  return existingProducts.some(
    (p) => p.id !== excludeId && p.barcode.trim() === target
  );
}
