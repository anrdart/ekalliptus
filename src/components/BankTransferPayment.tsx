import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Copy, CreditCard, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Bank {
  id: string;
  name: string;
  accountNumber: string;
  accountName: string;
  icon: string;
  color: string;
}

interface BankTransferPaymentProps {
  amount: number;
  orderId: string;
  customerName: string;
  onPaymentConfirmed?: () => void;
}

const banks: Bank[] = [
  {
    id: 'bca',
    name: 'Bank Central Asia (BCA)',
    accountNumber: '1234-5678-9012',
    accountName: 'Haikal Akhalul Azhar',
    icon: '🏦',
    color: 'bg-primary',
  },
  {
    id: 'mandiri',
    name: 'Bank Mandiri',
    accountNumber: '1234-5678-9012',
    accountName: 'Haikal Akhalul Azhar',
    icon: '🏦',
    color: 'bg-red-500',
  },
  {
    id: 'btn',
    name: 'Bank Tabungan Negara (BTN)',
    accountNumber: '1234-5678-9012',
    accountName: 'Haikal Akhalul Azhar',
    icon: '🏦',
    color: 'bg-purple-500',
  },
  {
    id: 'krom',
    name: 'Bank Krom',
    accountNumber: '1234-5678-9012',
    accountName: 'Haikal Akhalul Azhar',
    icon: '🏦',
    color: 'bg-orange-500',
  },
  {
    id: 'saku',
    name: 'Bank Saku',
    accountNumber: '1234-5678-9012',
    accountName: 'Haikal Akhalul Azhar',
    icon: '🏦',
    color: 'bg-green-500',
  },
  {
    id: 'jago',
    name: 'Bank Jago',
    accountNumber: '1234-5678-9012',
    accountName: 'Haikal Akhalul Azhar',
    icon: '🏦',
    color: 'bg-yellow-500',
  },
];

const BankTransferPayment = ({
  amount,
  orderId,
  customerName,
  onPaymentConfirmed,
}: BankTransferPaymentProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handlePaymentConfirmed = () => {
    if (onPaymentConfirmed) {
      onPaymentConfirmed();
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
          <CreditCard className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Transfer Bank
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Pilih bank dan lakukan transfer sesuai instruksi
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
          <span className="font-mono text-gray-900 dark:text-white">{orderId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Total Transfer:</span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formattedAmount}
          </span>
        </div>
      </div>

      {/* Bank Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Pilih Bank
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banks.map((bank) => (
            <div
              key={bank.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary ${
                selectedBank?.id === bank.id
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-gray-200 dark:border-gray-600'
              }`}
              onClick={() => setSelectedBank(bank)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${bank.color} rounded-full flex items-center justify-center text-white text-2xl`}>
                  {bank.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {bank.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {bank.accountName}
                  </p>
                </div>
                {selectedBank?.id === bank.id && (
                  <CheckCircle className="w-6 h-6 text-primary" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer Instructions */}
      {selectedBank && (
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg p-6 mb-8">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-primary" />
            Instruksi Transfer - {selectedBank.name}
          </h4>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">No. Rekening:</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-mono font-bold text-gray-900 dark:text-white">
                  {selectedBank.accountNumber}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(selectedBank.accountNumber, 'Account Number')}
                  className="h-8 w-8 p-0"
                >
                  {copied === 'Account Number' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Atas Nama:</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedBank.accountName}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(selectedBank.accountName, 'Account Name')}
                  className="h-8 w-8 p-0"
                >
                  {copied === 'Account Name' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Jumlah Transfer:</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formattedAmount}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(amount.toString(), 'Amount')}
                  className="h-8 w-8 p-0"
                >
                  {copied === 'Amount' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ⬆️ Klik untuk copy
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                📝 Catatan Transfer:
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Tuliskan Order ID <strong>{orderId}</strong> di berita/deskripsi transfer
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                Informasi ini akan membantu kami memverifikasi pembayaran Anda
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation */}
      <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-center">
          Setelah Transfer
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 text-center">
          Tim kami akan memverifikasi pembayaran Anda dalam 1x24 jam. Anda akan menerima email konfirmasi setelah pembayaran diverifikasi.
        </p>
        <Button
          onClick={handlePaymentConfirmed}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Konfirmasi Pembayaran
        </Button>
      </div>
    </div>
  );
};

export default BankTransferPayment;
