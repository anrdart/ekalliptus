import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Home, RefreshCw, CreditCard, AlertCircle } from 'lucide-react';
import { getPaymentStatus } from '@/lib/midtrans';

const PaymentUnfinish = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
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

  const handleRetryPayment = () => {
    // Redirect back to payment page
    navigate('/payment');
  };

  const handleCheckStatus = async () => {
    if (!orderId) return;

    setIsChecking(true);
    try {
      const status = await getPaymentStatus(orderId);
      setPaymentData(status);

      // If payment is now complete, redirect to finish page
      if (status.transaction_status === 'settlement' || status.transaction_status === 'capture') {
        navigate(`/payment/finish?order_id=${orderId}`);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusMessage = () => {
    if (!paymentData) {
      return {
        title: 'Pembayaran Belum Selesai',
        description: 'Pembayaran Anda belum diselesaikan',
        icon: Clock,
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      };
    }

    switch (paymentData.transaction_status) {
      case 'pending':
        return {
          title: 'Menunggu Pembayaran',
          description: 'Pembayaran Anda sedang menunggu konfirmasi',
          icon: Clock,
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        };
      case 'deny':
        return {
          title: 'Pembayaran Ditolak',
          description: 'Pembayaran Anda ditolak oleh sistem',
          icon: AlertCircle,
          iconColor: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
        };
      case 'cancel':
        return {
          title: 'Pembayaran Dibatalkan',
          description: 'Pembayaran Anda telah dibatalkan',
          icon: AlertCircle,
          iconColor: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
        };
      case 'expire':
        return {
          title: 'Pembayaran Kedaluwarsa',
          description: 'Waktu pembayaran telah habis',
          icon: AlertCircle,
          iconColor: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
        };
      default:
        return {
          title: 'Pembayaran Belum Selesai',
          description: 'Pembayaran Anda belum diselesaikan',
          icon: Clock,
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        };
    }
  };

  const statusInfo = getStatusMessage();
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <Helmet>
        <title>Pembayaran Belum Selesai - Ekalliptus</title>
        <meta name="description" content="Pembayaran Anda belum selesai" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Status Animation */}
          <div className="mb-8 text-center">
            <div className={`mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full ${statusInfo.bgColor}`}>
              <StatusIcon className={`h-12 w-12 ${statusInfo.iconColor}`} />
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
              {statusInfo.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {statusInfo.description}
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detail Pesanan</CardTitle>
              <CardDescription>
                Informasi pesanan Anda
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
                    <span className="text-sm font-medium capitalize text-yellow-600 dark:text-yellow-400">
                      {paymentData.transaction_status || 'Pending'}
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
                  Data pembayaran tidak ditemukan
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCheckStatus}
                disabled={isChecking || !orderId}
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Memeriksa...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Periksa Status Pembayaran
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Information Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Apa yang harus dilakukan?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  1
                </span>
                <p>
                  Jika Anda telah menyelesaikan pembayaran, mohon tunggu beberapa saat dan klik
                  tombol "Periksa Status Pembayaran"
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  2
                </span>
                <p>
                  Jika Anda belum menyelesaikan pembayaran, Anda dapat melakukan pembayaran
                  ulang dengan menekan tombol "Coba Lagi"
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  3
                </span>
                <p>
                  Untuk metode pembayaran tertentu (seperti transfer bank), proses konfirmasi
                  dapat memakan waktu hingga 1x24 jam
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="w-full"
              size="lg"
              onClick={handleRetryPayment}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Coba Lagi
            </Button>
            <Button
              variant="outline"
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
              Butuh bantuan? Hubungi kami di{' '}
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

export default PaymentUnfinish;
