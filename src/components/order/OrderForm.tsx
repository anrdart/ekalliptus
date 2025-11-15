'use client';

import { useState, useEffect } from 'react';
import { Customer, OrderItem, Delivery } from '@/lib/order/types';
import { PRODUCTS, VOUCHERS } from '@/lib/order/data';
import {
  CONFIG,
  findProduct,
  getItemUnitPrice,
  normalizeWhatsApp,
  isPreorderValid
} from '@/lib/order/calc';
import { validateOrder, getFirstErrorField, ValidationError } from '@/lib/order/validation';

interface OrderFormProps {
  customer: Customer;
  items: OrderItem[];
  delivery: Delivery;
  voucher: string;
  onCustomerChange: (customer: Customer) => void;
  onItemsChange: (items: OrderItem[]) => void;
  onDeliveryChange: (delivery: Delivery) => void;
  onVoucherChange: (voucher: string) => void;
  onErrorsChange: (errors: ValidationError[]) => void;
}

export default function OrderForm({
  customer,
  items,
  delivery,
  voucher,
  onCustomerChange,
  onItemsChange,
  onDeliveryChange,
  onVoucherChange,
  onErrorsChange
}: OrderFormProps) {
  const [voucherError, setVoucherError] = useState<string>('');
  const [preorderError, setPreorderError] = useState<string>('');

  useEffect(() => {
    const errors = validateOrder(customer, items, delivery, voucher).errors;
    onErrorsChange(errors);
  }, [customer, items, delivery, voucher, onErrorsChange]);

  useEffect(() => {
    if (delivery.date && delivery.time && !isPreorderValid(delivery.date, delivery.time)) {
      setPreorderError(`Pengambilan minimal ${CONFIG.PREORDER_CUTOFF_HOURS} jam dari waktu sekarang`);
    } else {
      setPreorderError('');
    }
  }, [delivery.date, delivery.time]);

  const handleWhatsAppChange = (value: string) => {
    const normalized = normalizeWhatsApp(value);
    onCustomerChange({ ...customer, whatsapp: normalized });
  };

  const addItem = () => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      productId: null,
      variantName: null,
      addonNames: [],
      qty: 1
    };
    onItemsChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'productId') {
      const product = findProduct(value);
      newItems[index].variantName = product?.variants?.[0]?.name || null;
      newItems[index].addonNames = [];
    }

    onItemsChange(newItems);
  };

  const handleApplyVoucher = () => {
    if (!voucher) {
      setVoucherError('');
      return;
    }

    const subtotal = items.reduce((sum, item) => sum + getItemUnitPrice(item) * item.qty, 0);
    const voucherData = VOUCHERS.find(v => v.code.toLowerCase() === voucher.toLowerCase());

    if (!voucherData) {
      setVoucherError('Kode voucher tidak valid');
      return;
    }

    if (subtotal < voucherData.minSpend) {
      setVoucherError(`Minimum pembelian Rp ${voucherData.minSpend.toLocaleString('id-ID')}`);
      return;
    }

    if (voucherData.validUntil) {
      const validUntil = new Date(voucherData.validUntil);
      if (validUntil < new Date()) {
        setVoucherError('Voucher sudah expired');
        return;
      }
    }

    setVoucherError('');
  };

  return (
    <div className="space-y-8">
      <div className="glass-panel neon-border rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Data Pemesan</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Nama Lengkap <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={customer.name}
                onChange={e => onCustomerChange({ ...customer, name: e.target.value })}
                className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-foreground mb-2">
                Nomor WhatsApp <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="whatsapp"
                  type="tel"
                  value={customer.whatsapp}
                  onChange={e => handleWhatsAppChange(e.target.value)}
                  className="flex-1 px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="08123456789"
                />
                <a
                  href={`https://wa.me/${customer.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-secondary to-primary text-white rounded-xl hover:from-emerald-600 hover:to-primary whitespace-nowrap font-medium transition-all"
                >
                  Chat
                </a>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email (opsional)
            </label>
            <input
              id="email"
              type="email"
              value={customer.email || ''}
              onChange={e => onCustomerChange({ ...customer, email: e.target.value })}
              className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
              Alamat Lengkap
            </label>
            <textarea
              id="address"
              value={customer.address || ''}
              onChange={e => onCustomerChange({ ...customer, address: e.target.value })}
              className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              rows={3}
              placeholder="Jl. Raya No. 123, Kota, Provinsi"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-foreground mb-2">
                Provinsi
              </label>
              <input
                id="province"
                type="text"
                value={customer.province || ''}
                onChange={e => onCustomerChange({ ...customer, province: e.target.value })}
                className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="DKI Jakarta"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                Kota
              </label>
              <input
                id="city"
                type="text"
                value={customer.city || ''}
                onChange={e => onCustomerChange({ ...customer, city: e.target.value })}
                className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Jakarta"
              />
            </div>
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-foreground mb-2">
                Kecamatan
              </label>
              <input
                id="district"
                type="text"
                value={customer.district || ''}
                onChange={e => onCustomerChange({ ...customer, district: e.target.value })}
                className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Jakarta Pusat"
              />
            </div>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-foreground mb-2">
              Catatan (opsional)
            </label>
            <textarea
              id="note"
              value={customer.note || ''}
              onChange={e => onCustomerChange({ ...customer, note: e.target.value })}
              className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              rows={2}
              placeholder="Catatan tambahan..."
            />
          </div>
        </div>
      </div>

      <div className="glass-panel neon-border rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Detail Pesanan</h2>
        <div className="space-y-6">
          {items.map((item, index) => {
            const product = item.productId ? findProduct(item.productId) : null;
            return (
              <div key={item.id} className="glass-panel bg-card/10 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-foreground">Item {index + 1}</h3>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-destructive hover:text-destructive/80 text-sm font-medium"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Produk <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={item.productId || ''}
                      onChange={e => updateItem(index, 'productId', e.target.value || null)}
                      className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="">Pilih Produk</option>
                      {PRODUCTS.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - Rp {product.basePrice.toLocaleString('id-ID')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {product?.variants && product.variants.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Varian</label>
                      <select
                        value={item.variantName || ''}
                        onChange={e => updateItem(index, 'variantName', e.target.value || null)}
                        className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      >
                        {product.variants.map(variant => (
                          <option key={variant.name} value={variant.name}>
                            {variant.name}
                            {variant.priceDelta > 0 && ` (+Rp ${variant.priceDelta.toLocaleString('id-ID')})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Jumlah <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={e => updateItem(index, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Harga Satuan</label>
                    <input
                      type="text"
                      value={`Rp ${getItemUnitPrice(item).toLocaleString('id-ID')}`}
                      readOnly
                      className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl"
                    />
                  </div>
                </div>

                {product?.addons && product.addons.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">Add-ons</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {product.addons.map(addon => (
                        <label key={addon.name} className="flex items-center gap-3 p-3 bg-card/30 rounded-lg cursor-pointer hover:bg-card/50 transition-all">
                          <input
                            type="checkbox"
                            checked={item.addonNames?.includes(addon.name) || false}
                            onChange={e => {
                              const addonNames = item.addonNames || [];
                              const newAddonNames = e.target.checked
                                ? [...addonNames, addon.name]
                                : addonNames.filter(name => name !== addon.name);
                              updateItem(index, 'addonNames', newAddonNames);
                            }}
                            className="rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-foreground">
                            {addon.name} (+Rp {addon.price.toLocaleString('id-ID')})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">Subtotal:</span>
                  <span className="text-lg font-semibold text-foreground">
                    Rp {(getItemUnitPrice(item) * item.qty).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addItem}
            className="w-full py-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-foreground flex items-center justify-center gap-2 font-medium transition-all"
          >
            + Tambah Item
          </button>
        </div>
      </div>

      <div className="glass-panel neon-border rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Metode Pengambilan</h2>
        <div className="space-y-6">
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="delivery-method"
                value="pickup"
                checked={delivery.method === 'pickup'}
                onChange={e => onDeliveryChange({ ...delivery, method: e.target.value as 'pickup' | 'ship', shippingCost: e.target.value === 'pickup' ? 0 : delivery.shippingCost })}
                className="text-primary focus:ring-primary"
              />
              <span className="text-foreground font-medium">Ambil di Tempat</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="delivery-method"
                value="ship"
                checked={delivery.method === 'ship'}
                onChange={e => onDeliveryChange({ ...delivery, method: e.target.value as 'pickup' | 'ship', shippingCost: e.target.value === 'ship' ? CONFIG.DEFAULT_ONGKIR : 0, courier: e.target.value === 'ship' ? 'Kurir Lokal' : '' })}
                className="text-primary focus:ring-primary"
              />
              <span className="text-foreground font-medium">Kirim</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
                Tanggal <span className="text-destructive">*</span>
              </label>
              <input
                id="date"
                type="date"
                value={delivery.date || ''}
                onChange={e => onDeliveryChange({ ...delivery, date: e.target.value })}
                className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-foreground mb-2">
                Waktu <span className="text-destructive">*</span>
              </label>
              <input
                id="time"
                type="time"
                value={delivery.time || ''}
                onChange={e => onDeliveryChange({ ...delivery, time: e.target.value })}
                className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              {preorderError && (
                <p className="mt-2 text-sm text-destructive">{preorderError}</p>
              )}
            </div>
          </div>

          {delivery.method === 'ship' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="courier" className="block text-sm font-medium text-foreground mb-2">
                    Kurir
                  </label>
                  <input
                    id="courier"
                    type="text"
                    value={delivery.courier || ''}
                    onChange={e => onDeliveryChange({ ...delivery, courier: e.target.value })}
                    className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Kurir Lokal"
                  />
                </div>

                <div>
                  <label htmlFor="shippingCost" className="block text-sm font-medium text-foreground mb-2">
                    Ongkos Kirim <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="shippingCost"
                    type="number"
                    min="0"
                    value={delivery.shippingCost}
                    onChange={e => onDeliveryChange({ ...delivery, shippingCost: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="15000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="packaging" className="block text-sm font-medium text-foreground mb-2">
                  Packaging
                </label>
                <input
                  id="packaging"
                  type="text"
                  value={delivery.packaging || ''}
                  onChange={e => onDeliveryChange({ ...delivery, packaging: e.target.value })}
                  className="w-full px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Kardus, Plastik, dll"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="glass-panel neon-border rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Voucher / Promo</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={voucher}
              onChange={e => onVoucherChange(e.target.value)}
              className="flex-1 px-4 py-3 bg-card/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Masukkan kode voucher"
            />
            <button
              type="button"
              onClick={handleApplyVoucher}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:from-primary hover:to-secondary font-medium transition-all"
            >
              Terapkan
            </button>
          </div>
          {voucherError && (
            <p className="text-sm text-destructive">{voucherError}</p>
          )}
          {!voucherError && voucher && (
            <p className="text-sm text-emerald-400">Voucher berhasil diterapkan!</p>
          )}
          <div className="mt-6 glass-panel bg-card/10 rounded-xl p-4">
            <p className="text-sm font-medium text-foreground mb-3">Voucher tersedia:</p>
            <ul className="space-y-2">
              {VOUCHERS.map(v => (
                <li key={v.code} className="text-sm text-muted-foreground">
                  <span className="font-mono font-semibold text-foreground">{v.code}</span> -{' '}
                  {v.type === 'percent' ? `${v.value}%` : `Rp ${v.value.toLocaleString('id-ID')}`}
                  {v.validUntil && ` (expired: ${new Date(v.validUntil).toLocaleDateString('id-ID')})`}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
