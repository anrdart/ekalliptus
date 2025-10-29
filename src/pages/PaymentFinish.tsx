import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Home, Download, Mail } from 'lucide-react';
import { getPaymentStatus } from '@/lib/midtrans';

const PaymentFinish = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        const status = await getPaymentStatus(orderId);
        setPaymentData(status);
      } catch (error) {
        console.error('Error fetching payment status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Simulate loading
    const timer = setTimeout(() => {
      fetchPaymentStatus();
    }, 1000);

    return () => clearTimeout(timer);
  }, [orderId]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleDownloadReceipt = () => {
    // Implementasi download invoice/receipt
    console.log('Download receipt for order:', orderId);
    // Dalam production, ini akan generate PDF atau redirect ke halaman invoice
  };

  const handleSendEmail = () => {
    // Implementasi kirim email receipt
    console.log('Send email receipt for order:', orderId);
    // Dalam production, ini akan trigger backend untuk kirim email
  };

  return (
    <>
      <Helmet>
        <title>Pembayaran Berhasil - Ekalliptus</title>
        <meta name="description" content="Pembayaran Anda telah berhasil diproses" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Success Animation */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
              Pembayaran Berhasil!
            </h1>
            <p className="text-lg text-muted-foreground">
              Terima kasih atas pembayaran Anda
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detail Pesanan</CardTitle>
              <CardDescription>
                Pesanan Anda telah dikonfirmasi dan sedang diproses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderId && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Order ID</span>
                    <span className="font-mono text-sm font-medium">{orderId}</span>
                  </div>
                  <Separator />
                </>
              )}

              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
                </div>
              ) : paymentData ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status Transaksi</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {paymentData.transaction_status || 'Success'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Metode Pembayaran</span>
                    <span className="text-sm font-medium">
                      {paymentData.payment_type || 'Midtrans'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Pembayaran</span>
                    <span className="text-sm font-medium">
                      Rp {parseInt(paymentData.gross_amount || '0').toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Waktu Transaksi</span>
                    <span className="text-sm font-medium">
                      {paymentData.transaction_time
                        ? new Date(paymentData.transaction_time).toLocaleString('id-ID')
                        : new Date().toLocaleString('id-ID')}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  Data pembayaran sedang diproses
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleDownloadReceipt}
              >
                <Download className="mr-2 h-4 w-4" />
                Unduh Struk
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleSendEmail}
              >
                <Mail className="mr-2 h-4 w-4" />
                Kirim Email
              </Button>
            </CardFooter>
          </Card>

          {/* Information Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Langkah Selanjutnya</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  1
                </span>
                <p>Email konfirmasi telah dikirim ke alamat email Anda</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  2
                </span>
                <p>Pesanan Anda akan segera diproses dalam 1x24 jam</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  3
                </span>
                <p>Anda akan mendapatkan notifikasi update status pesanan</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="w-full"
              size="lg"
              onClick={handleGoHome}
            >
              <Home className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </div>

          {/* Support Notice */}
          <div className="mt-8 rounded-lg border border-muted bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            <p>
              Ada pertanyaan? Hubungi kami di{' '}
              <a href="mailto:support@ekalliptus.id" className="font-medium text-primary hover:underline">
                support@ekalliptus.id
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFinish;
