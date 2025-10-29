import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, Home, RefreshCw, Mail } from 'lucide-react';

const Error = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get('order_id');
  const errorMessage = searchParams.get('message') || 'Terjadi kesalahan saat memproses pembayaran';

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetryPayment = () => {
    navigate('/payment');
  };

  const handleContactSupport = () => {
    // Open email client
    window.location.href = `mailto:support@ekalliptus.id?subject=Bantuan Pembayaran - Order ${orderId || 'N/A'}&body=Saya mengalami masalah dengan pembayaran:%0D%0A%0D%0AOrder ID: ${orderId || 'N/A'}%0D%0APesan Error: ${errorMessage}`;
  };

  return (
    <>
      <Helmet>
        <title>Error - Ekalliptus</title>
        <meta name="description" content="Terjadi kesalahan" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Error Animation */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
              Oops! Terjadi Kesalahan
            </h1>
            <p className="text-lg text-muted-foreground">
              Maaf, ada masalah saat memproses permintaan Anda
            </p>
          </div>

          {/* Error Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detail Error</CardTitle>
              <CardDescription>
                Informasi tentang kesalahan yang terjadi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderId && (
                <div className="rounded-lg border border-muted bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm font-medium">{orderId}</p>
                </div>
              )}

              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {errorMessage}
                </p>
              </div>
            </CardContent>
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
                  Coba lakukan pembayaran ulang dengan menekan tombol "Coba Lagi" di bawah
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  2
                </span>
                <p>
                  Pastikan koneksi internet Anda stabil dan data yang Anda masukkan sudah benar
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  3
                </span>
                <p>
                  Jika masalah berlanjut, silakan hubungi tim support kami untuk bantuan lebih lanjut
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Possible Causes Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Kemungkinan Penyebab</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Koneksi internet tidak stabil</p>
              <p>• Saldo atau limit kartu tidak mencukupi</p>
              <p>• Informasi pembayaran tidak valid</p>
              <p>• Gangguan pada sistem pembayaran</p>
              <p>• Browser memblokir popup pembayaran</p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handleRetryPayment}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Coba Lagi
            </Button>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                size="lg"
                onClick={handleContactSupport}
              >
                <Mail className="mr-2 h-4 w-4" />
                Hubungi Support
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleGoHome}
              >
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </div>
          </div>

          {/* Support Notice */}
          <div className="mt-8 rounded-lg border border-muted bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            <p className="mb-2 font-medium">Butuh Bantuan Segera?</p>
            <p>
              Hubungi kami di{' '}
              <a href="mailto:support@ekalliptus.id" className="font-medium text-primary hover:underline">
                support@ekalliptus.id
              </a>
              {' '}atau WhatsApp{' '}
              <a href="https://wa.me/6281234567890" className="font-medium text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                +62 812-3456-7890
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Error;
