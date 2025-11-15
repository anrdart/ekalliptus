import { Product, Voucher } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'paket-a',
    name: 'Paket A',
    basePrice: 35000,
    variants: [
      { name: 'Original', priceDelta: 0 },
      { name: 'Pedas', priceDelta: 0 }
    ],
    addons: [
      { name: 'Keju', price: 5000 },
      { name: 'Telur', price: 6000 },
      { name: 'Sosis', price: 8000 }
    ]
  },
  {
    id: 'paket-b',
    name: 'Paket B',
    basePrice: 50000,
    variants: [
      { name: 'Regular', priceDelta: 0 },
      { name: 'Large', priceDelta: 10000 }
    ],
    addons: [
      { name: 'Keju', price: 5000 },
      { name: 'Telur', price: 6000 },
      { name: 'Extra Nasi', price: 5000 }
    ]
  },
  {
    id: 'paket-c',
    name: 'Paket C',
    basePrice: 75000,
    variants: [
      { name: 'Single', priceDelta: 0 },
      { name: 'Paket Keluarga', priceDelta: 50000 }
    ],
    addons: [
      { name: 'Minuman', price: 10000 },
      { name: 'Keripik', price: 8000 },
      { name: 'Sambal Extra', price: 5000 }
    ]
  },
  {
    id: 'snack-box',
    name: 'Snack Box',
    basePrice: 25000,
    addons: [
      { name: 'Kue Cubit', price: 3000 },
      { name: 'Martabak Mini', price: 5000 },
      { name: 'Es Cendol', price: 7000 }
    ]
  }
];

export const VOUCHERS: Voucher[] = [
  {
    code: 'HEMAT10',
    type: 'percent',
    value: 10,
    minSpend: 100000
  },
  {
    code: 'POT20K',
    type: 'nominal',
    value: 20000,
    minSpend: 120000
  },
  {
    code: 'WELCOME15',
    type: 'percent',
    value: 15,
    minSpend: 150000,
    validUntil: '2025-12-31'
  }
];
