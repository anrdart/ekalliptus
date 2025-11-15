import QRCode from 'qrcode';

export interface DynamicQROptions {
  amount: number;
  orderId: string;
  merchantName?: string;
  merchantId?: string;
  description?: string;
}

/**
 * Generates a proper QRIS QR code string with embedded payment data
 * This allows automatic amount and payment reference filling
 * Note: For production use, you need to register with a QRIS acquirer (bank or PSP)
 */
export function generateQRISDataString(options: DynamicQROptions): string {
  const {
    amount,
    orderId,
    merchantName = "Ekalliptus Digital",
    merchantId = "ID10234567890",
    description = `Pembayaran ${orderId}`,
  } = options;

  // Format amount in centavos (no decimal)
  const formattedAmount = Math.round(amount).toString();

  // Truncate orderId to fit QRIS limits
  const refLabel = orderId.substring(0, 25);

  // Create proper QRIS format with merchant account info
  // Using ID10234567890 as merchant ID (this should be registered in QRIS system)
  const merchantAccountInfo = [
    '00', // GoPay
    merchantId.length.toString().padStart(2, '0'),
    merchantId,
    '01', // Additional data field
    '07',
    refLabel.length.toString().padStart(2, '0'),
    refLabel,
  ].join('');

  const additionalDataField = [
    '07', // Reference Label
    refLabel.length.toString().padStart(2, '0'),
    refLabel,
  ].join('');

  const qrisData = [
    '000201', // Payload Format Indicator: 01
    '010211', // Point of Initiation Method: 11 (dynamic)

    // Merchant Account Information
    '29', // Tag 29: Merchant Account Information
    merchantAccountInfo.length.toString().padStart(2, '0'),
    merchantAccountInfo,

    // Country Code
    '58', // Tag 58: Country Code
    '02', // Length
    'ID', // Indonesia

    // Merchant Name
    '59', // Tag 59: Merchant Name
    merchantName.length.toString().padStart(2, '0'),
    merchantName,

    // Additional Data Field Template (Reference Label)
    '62', // Tag 62: Additional Data Field Template
    additionalDataField.length.toString().padStart(2, '0'),
    additionalDataField,

    // Transaction Amount
    '54', // Tag 54: Transaction Amount
    formattedAmount.length.toString().padStart(2, '0'),
    formattedAmount,

    // CRC16 placeholder
    '6304',
  ].join('');

  // Calculate CRC16-CCITT checksum
  const crc = calculateCRC16CCITT(qrisData);
  const finalQris = qrisData + crc.toUpperCase();

  // Log for debugging
  console.log('=== QRIS Debug Info ===');
  console.log('Order ID:', orderId);
  console.log('Amount:', formattedAmount);
  console.log('Reference Label:', refLabel);
  console.log('Merchant ID:', merchantId);
  console.log('QRIS Length:', finalQris.length);
  console.log('QRIS String:', finalQris);
  console.log('========================');

  return finalQris;
}

/**
 * Generate QR code as SVG string (for embedding)
 */
export async function generateQRSvg(options: DynamicQROptions): Promise<string> {
  const qrisData = generateQRISDataString(options);

  try {
    const svgString = await QRCode.toString(qrisData, {
      type: 'svg',
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return svgString;
  } catch (error) {
    console.error('Error generating QR SVG:', error);
    throw error;
  }
}

/**
 * Calculate CRC16-CCITT checksum
 */
function calculateCRC16CCITT(data: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export default {
  generateQRISDataString,
  generateQRSvg,
};
