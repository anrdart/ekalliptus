export interface Variant {
  name: string;
  priceDelta: number;
}

export interface Addon {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  basePrice: number;
  variants?: Variant[];
  addons?: Addon[];
}

export interface Voucher {
  code: string;
  type: "percent" | "nominal";
  value: number;
  minSpend: number;
  validUntil?: string;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  variantName?: string | null;
  addonNames?: string[];
  qty: number;
}

export interface Customer {
  name: string;
  whatsapp: string;
  email?: string;
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  note?: string;
}

export interface Delivery {
  method: "pickup" | "ship" | "";
  date?: string;
  time?: string;
  courier?: string;
  shippingCost: number;
  packaging?: string;
}

export interface Amounts {
  subtotal: number;
  discount: number;
  dpp: number;
  ppn: number;
  biaya: number;
  grand: number;
  dp: number;
  sisa: number;
}

export interface OrderState {
  customer: Customer;
  items: OrderItem[];
  delivery: Delivery;
  voucher: string;
  amounts: Amounts;
  paymentRef?: string;
  paymentUrl?: string;
  orderId?: string;
}

export interface PaymentPayload {
  orderId: string;
  amount: number;
  customer: Customer;
  items: OrderItem[];
  amounts: Amounts;
  delivery: Delivery;
}
