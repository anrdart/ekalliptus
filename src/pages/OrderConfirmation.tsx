import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Phone, MessageCircle, Mail } from "lucide-react";
import { useCheckout } from "@/context/CheckoutContext";
import { getCanonicalUrl, PAGE_SEO } from "@/config/seo.config";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session, clearCheckoutSession } = useCheckout();

  const orderId = searchParams.get("order_id");

  useEffect(() => {
    // Redirect if no session or invalid order ID
    if (!session || !orderId || session.orderId !== orderId) {
      navigate("/");
      return;
    }

    // Clear checkout session after showing confirmation
    const timer = setTimeout(() => {
      clearCheckoutSession();
    }, 30000); // Clear after 30 seconds

    return () => clearTimeout(timer);
  }, [session, orderId, navigate, clearCheckoutSession]);

  if (!session || session.orderId !== orderId) {
    return null;
  }

  const handleBackToHome = () => {
    clearCheckoutSession();
    navigate("/");
  };

  const contactIcon = session.customer.contactPreference === "whatsapp" ? MessageCircle :
                      session.customer.contactPreference === "email" ? Mail : Phone;

  const ContactIconComponent = contactIcon;

  return (
    <>
      <Helmet>
        <title>Order Berhasil - ekalliptus</title>
        <meta name="description" content="Order layanan berhasil dibuat. Tim kami akan segera menghubungi Anda untuk konfirmasi jadwal." />
        <meta property="og:title" content="Order Berhasil - ekalliptus" />
        <meta property="og:description" content="Order layanan berhasil dibuat. Tim kami akan segera menghubungi Anda untuk konfirmasi jadwal." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={getCanonicalUrl("/order-confirmation")} />
      </Helmet>

      <section className="relative min-h-screen content-vis px-4 py-24">
        <div className="relative z-10 mx-auto max-w-2xl">
          <Card className="glass-panel neon-border p-8 shadow-elegant text-center">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <CardTitle className="text-3xl font-semibold text-foreground">
                Order Berhasil Dibuat!
              </CardTitle>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                ID: {session.orderId}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Detail Layanan</h3>
                <div className="bg-card/25 rounded-xl p-4 text-left">
                  <p className="font-medium text-foreground">{session.service.serviceId}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {session.submissionSummary.deskripsi}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Informasi Kontak</h3>
                <div className="bg-card/25 rounded-xl p-4 grid grid-cols-1 gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <ContactIconComponent className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{session.customer.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        Preferensi: {session.customer.contactPreference}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{session.customer.whatsapp}</p>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{session.customer.email}</p>
                    <p className="text-sm text-muted-foreground">Email</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Pembayaran</h3>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 mb-2">
                    Bayar di Tempat
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Pembayaran akan dilakukan langsung saat layanan diberikan atau setelah diagnosa selesai.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Langkah Selanjutnya</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">1</div>
                    <p className="text-sm text-muted-foreground">
                      Tim ekalliptus akan menghubungi Anda dalam 1-3 jam kerja sesuai preferensi komunikasi Anda.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">2</div>
                    <p className="text-sm text-muted-foreground">
                      Konfirmasi jadwal dan detail layanan melalui komunikasi yang telah disepakati.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">3</div>
                    <p className="text-sm text-muted-foreground">
                      Pembayaran dilakukan sesuai kesepakatan saat layanan diberikan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleBackToHome}
                  className="w-full rounded-full px-8 py-6 text-sm font-semibold uppercase tracking-wide"
                >
                  Kembali ke Beranda
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Terima kasih telah memilih layanan ekalliptus. Kami berkomitmen memberikan pelayanan terbaik!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
};

export default OrderConfirmation;
