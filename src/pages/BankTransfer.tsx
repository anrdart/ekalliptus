import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import BankTransferPayment from "@/components/BankTransferPayment";

interface OrderData {
  orderId: string;
  customer: {
    name: string;
    email: string;
    whatsapp: string;
    contactPreference: string;
  };
  service: {
    serviceId: string;
    serviceKey: string;
    summary: string;
    details: any;
    price: number;
  };
  submissionSummary: any;
  createdAt: string;
  status: string;
  attachments?: { key: string; url: string; name: string }[];
}

const BankTransferPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("qrOrderData");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setOrderData(parsed);
      } catch (error) {
        console.error("Failed to parse order data:", error);
        toast({
          title: "Error",
          description: "Data order tidak valid",
          variant: "destructive",
        });
        navigate("/order");
      }
    } else {
      toast({
        title: "Error",
        description: "Data order tidak ditemukan",
        variant: "destructive",
      });
      navigate("/order");
    }
  }, [navigate, toast]);

  const handlePaymentConfirmed = () => {
    setShowSuccess(true);
    toast({
      title: "Konfirmasi pembayaran diterima",
      description: "Tim kami akan memverifikasi pembayaran Anda dalam 1x24 jam",
    });

    // Clear the order data after successful confirmation
    setTimeout(() => {
      sessionStorage.removeItem("qrOrderData");
    }, 3000);
  };

  if (!orderData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <>
        <Helmet>
          <title>Pembayaran Berhasil - ekalliptus</title>
          <meta name="description" content="Pembayaran Anda telah dikonfirmasi" />
        </Helmet>

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Pembayaran DiKonfirmasi
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Terima kasih! Tim kami akan memverifikasi pembayaran Anda dan menghubungi Anda segera.
              </p>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ID Pesanan:</p>
                <p className="font-mono text-gray-900 dark:text-white">{orderData.orderId}</p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/")}
                  className="w-full bg-primary hover:bg-primary"
                >
                  Kembali ke Beranda
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/order")}
                  className="w-full"
                >
                  Buat Pesanan Baru
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pembayaran Transfer Bank - ekalliptus</title>
        <meta name="description" content="Lakukan pembayaran dengan transfer bank" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/order")}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Form Order
            </Button>
          </div>

          {/* Order Summary */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Ringkasan Pesanan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nama Pelanggan</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{orderData.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{orderData.customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{orderData.customer.whatsapp}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Layanan</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{orderData.service.serviceId}</p>
                </div>
                {orderData.attachments && orderData.attachments.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Lampiran</p>
                    <div className="space-y-2">
                      {orderData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline truncate"
                          >
                            {file.name}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {orderData.service.price > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Harga</p>
                    <p className="font-bold text-xl text-primary">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(orderData.service.price)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bank Transfer Payment Component */}
          <BankTransferPayment
            amount={orderData.service.price}
            orderId={orderData.orderId}
            customerName={orderData.customer.name}
            onPaymentConfirmed={handlePaymentConfirmed}
          />
        </div>
      </div>
    </>
  );
};

export default BankTransferPage;
