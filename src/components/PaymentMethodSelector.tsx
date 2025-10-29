import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  QrCode, 
  Store, 
  Wallet,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

// Type untuk payment method
export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'card' | 'ewallet' | 'bank_transfer' | 'qr_code' | 'convenience_store' | 'other';
  enabled: boolean;
  fee?: {
    type: 'fixed' | 'percentage';
    amount: number;
  };
  promo?: string;
  requiresAction?: boolean;
}

// List of available payment methods
const PAYMENT_METHODS: PaymentMethod[] = [
  // Credit/Debit Cards
  {
    id: 'credit_card',
    name: 'Kartu Kredit/Debit',
    description: 'Visa, Mastercard, JCB, Amex',
    icon: CreditCard,
    category: 'card',
    enabled: true,
    fee: {
      type: 'percentage',
      amount: 2.5,
    },
    promo: 'Beberapa bank menawarkan cicilan 0%',
    requiresAction: true,
  },
  
  // E-Wallets
  {
    id: 'gopay',
    name: 'GoPay',
    description: 'Instant confirmation',
    icon: Smartphone,
    category: 'ewallet',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 1000,
    },
  },
  {
    id: 'ovo',
    name: 'OVO',
    description: 'Instant confirmation',
    icon: Wallet,
    category: 'ewallet',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 1000,
    },
  },
  {
    id: 'dana',
    name: 'DANA',
    description: 'Instant confirmation',
    icon: Wallet,
    category: 'ewallet',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 1000,
    },
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    description: 'Instant confirmation',
    icon: Wallet,
    category: 'ewallet',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 1000,
    },
  },
  {
    id: 'linkaja',
    name: 'LinkAja',
    description: 'Instant confirmation',
    icon: Wallet,
    category: 'ewallet',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 1000,
    },
  },
  
  // Bank Transfers
  {
    id: 'bca_va',
    name: 'BCA Virtual Account',
    description: 'Konfirmasi otomatis',
    icon: Building2,
    category: 'bank_transfer',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 4000,
    },
  },
  {
    id: 'bni_va',
    name: 'BNI Virtual Account',
    description: 'Konfirmasi otomatis',
    icon: Building2,
    category: 'bank_transfer',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 4000,
    },
  },
  {
    id: 'bri_va',
    name: 'BRI Virtual Account',
    description: 'Konfirmasi otomatis',
    icon: Building2,
    category: 'bank_transfer',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 4000,
    },
  },
  {
    id: 'mandiri_va',
    name: 'Mandiri Virtual Account',
    description: 'Konfirmasi otomatis',
    icon: Building2,
    category: 'bank_transfer',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 4000,
    },
  },
  {
    id: 'cimb_va',
    name: 'CIMB Niaga Virtual Account',
    description: 'Konfirmasi otomatis',
    icon: Building2,
    category: 'bank_transfer',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 4000,
    },
  },
  {
    id: 'permata_va',
    name: 'Permata Virtual Account',
    description: 'Konfirmasi otomatis',
    icon: Building2,
    category: 'bank_transfer',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 4000,
    },
  },
  
  // QR Code
  {
    id: 'qris',
    name: 'QRIS',
    description: 'Scan QR dengan aplikasi apapun',
    icon: QrCode,
    category: 'qr_code',
    enabled: true,
    fee: {
      type: 'percentage',
      amount: 0.7,
    },
  },
  {
    id: 'gopay_qr',
    name: 'GoPay QRIS',
    description: 'Scan dengan GoJek app',
    icon: QrCode,
    category: 'qr_code',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 1000,
    },
  },
  
  // Convenience Store
  {
    id: 'alfamart',
    name: 'Alfamart',
    description: 'Bayar di gerai Alfamart',
    icon: Store,
    category: 'convenience_store',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 5000,
    },
  },
  {
    id: 'indomaret',
    name: 'Indomaret',
    description: 'Bayar di gerai Indomaret',
    icon: Store,
    category: 'convenience_store',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 5000,
    },
  },
  
  // Other
  {
    id: 'bca_klikpay',
    name: 'BCA KlikPay',
    description: 'BCA online banking',
    icon: CreditCard,
    category: 'other',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 4000,
    },
  },
  {
    id: 'cimb_clicks',
    name: 'CIMB Clicks',
    description: 'CIMB online banking',
    icon: CreditCard,
    category: 'other',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 4000,
    },
  },
  {
    id: 'danamon_online',
    name: 'Danamon Online Banking',
    description: 'Danamon online banking',
    icon: CreditCard,
    category: 'other',
    enabled: true,
    fee: {
      type: 'fixed',
      amount: 4000,
    },
  },
];

// Payment method categories
const PAYMENT_CATEGORIES = {
  card: {
    name: 'Kartu Kredit/Debit',
    description: 'Pembayaran dengan kartu kredit atau debit',
    icon: CreditCard,
  },
  ewallet: {
    name: 'E-Wallet',
    description: 'Pembayaran instan dengan dompet digital',
    icon: Smartphone,
  },
  bank_transfer: {
    name: 'Transfer Bank',
    description: 'Virtual account dari berbagai bank',
    icon: Building2,
  },
  qr_code: {
    name: 'QR Code',
    description: 'Scan QR code untuk pembayaran',
    icon: QrCode,
  },
  convenience_store: {
    name: 'Convenience Store',
    description: 'Bayar di gerai terdekat',
    icon: Store,
  },
  other: {
    name: 'Lainnya',
    description: 'Metode pembayaran lainnya',
    icon: CreditCard,
  },
};

// Props untuk PaymentMethodSelector
interface PaymentMethodSelectorProps {
  amount: number;
  selectedMethod?: string;
  onMethodChange?: (method: PaymentMethod) => void;
  disabled?: boolean;
  className?: string;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  amount,
  selectedMethod,
  onMethodChange,
  disabled = false,
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ewallet');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['ewallet']));
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);

  // Filter payment methods by category
  const getPaymentMethodsByCategory = (category: string) => {
    return PAYMENT_METHODS.filter(method => 
      method.category === category && method.enabled
    );
  };

  // Calculate fee
  const calculateFee = (method: PaymentMethod): number => {
    if (!method.fee) return 0;
    
    if (method.fee.type === 'fixed') {
      return method.fee.amount;
    } else {
      return (amount * method.fee.amount) / 100;
    }
  };

  // Calculate total amount
  const calculateTotal = (method: PaymentMethod): number => {
    return amount + calculateFee(method);
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Handle method selection
  const handleMethodSelect = (method: PaymentMethod) => {
    if (disabled) return;
    onMethodChange?.(method);
  };

  // Get selected payment method
  const selectedPaymentMethod = PAYMENT_METHODS.find(method => method.id === selectedMethod);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selected Method Summary */}
      {selectedPaymentMethod && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Metode Pembayaran Dipilih</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg border">
                <selectedPaymentMethod.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{selectedPaymentMethod.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedPaymentMethod.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-semibold">
                  Rp {calculateTotal(selectedPaymentMethod).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Metode Pembayaran</CardTitle>
          <CardDescription>
            Pilih metode pembayaran yang paling nyaman untuk Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(PAYMENT_CATEGORIES).map(([categoryKey, category]) => {
            const methods = getPaymentMethodsByCategory(categoryKey);
            const isExpanded = expandedCategories.has(categoryKey);
            const CategoryIcon = category.icon;

            if (methods.length === 0) return null;

            return (
              <div key={categoryKey} className="space-y-2">
                {/* Category Header */}
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                  onClick={() => toggleCategoryExpansion(categoryKey)}
                  disabled={disabled}
                >
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-5 w-5" />
                    <div className="text-left">
                      <h4 className="font-semibold">{category.name}</h4>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {/* Payment Methods */}
                {isExpanded && (
                  <div className="ml-8 space-y-2">
                    <RadioGroup
                      value={selectedMethod}
                      onValueChange={(value) => {
                        const method = methods.find(m => m.id === value);
                        if (method) {
                          handleMethodSelect(method);
                        }
                      }}
                    >
                      {methods.map((method) => {
                        const MethodIcon = method.icon;
                        const fee = calculateFee(method);
                        const total = calculateTotal(method);
                        const isHovered = hoveredMethod === method.id;

                        return (
                          <div
                            key={method.id}
                            className={`relative rounded-lg border p-3 transition-all cursor-pointer ${
                              selectedMethod === method.id
                                ? 'border-primary bg-primary/5'
                                : isHovered
                                ? 'border-muted-foreground/50 bg-muted/30'
                                : 'border-border'
                            }`}
                            onMouseEnter={() => setHoveredMethod(method.id)}
                            onMouseLeave={() => setHoveredMethod(null)}
                            onClick={() => handleMethodSelect(method)}
                          >
                            <div className="flex items-start gap-3">
                              <RadioGroupItem
                                value={method.id}
                                id={method.id}
                                disabled={disabled}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <MethodIcon className="h-4 w-4" />
                                  <Label
                                    htmlFor={method.id}
                                    className="font-semibold cursor-pointer"
                                  >
                                    {method.name}
                                  </Label>
                                  {method.promo && (
                                    <Badge variant="secondary" className="text-xs">
                                      Promo
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {method.description}
                                </p>
                                
                                {fee > 0 && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Info className="h-3 w-3" />
                                    <span>
                                      Biaya layanan: Rp {fee.toLocaleString('id-ID')}
                                    </span>
                                  </div>
                                )}

                                {method.promo && isHovered && (
                                  <div className="mt-2 p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                                    <p className="text-xs text-blue-800 dark:text-blue-200">
                                      💡 {method.promo}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="font-semibold">
                                  Rp {total.toLocaleString('id-ID')}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                )}

                {categoryKey !== Object.keys(PAYMENT_CATEGORIES)[Object.keys(PAYMENT_CATEGORIES).length - 1] && (
                  <Separator />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="rounded-lg border border-muted bg-muted/50 p-4 text-center text-sm text-muted-foreground">
        <p>
          🔒 Semua transaksi aman dan terenkripsi dengan Midtrans
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;