import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, CreditCard, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentData {
  orderId: string;
  amount: number;
  status: string;
}

const bankAccounts = [
  {
    id: "bca",
    bankName: "BCA",
    accountNumber: "7830679108",
    accountHolder: "Haikal Akhalul Azhar",
  },
  {
    id: "mandiri",
    bankName: "Mandiri",
    accountNumber: "1550013969962",
    accountHolder: "Haikal Akhalul Azhar",
  },
  {
    id: "krom",
    bankName: "Krom",
    accountNumber: "770058781909",
    accountHolder: "Haikal Akhalul Azhar",
  },
  {
    id: "jago",
    bankName: "Jago",
    accountNumber: "100738852391",
    accountHolder: "Haikal Akhalul Azhar",
  },
] as const;

const PaymentInstructionsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState("");
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  useEffect(() => {
    if (!orderId || !amount) {
      navigate("/");
      return;
    }

    setPaymentData({
      orderId,
      amount: parseInt(amount),
      status: "pending",
    });
  }, [orderId, amount, navigate]);

  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(parseInt(amount || "0"));

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  if (!paymentData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Instruksi Pembayaran - ekalliptus</title>
        <meta name="description" content="Instruksi pembayaran untuk pesanan Anda" />
      </Helmet>

      <div className="relative min-h-screen px-4 py-20">
        <div className="absolute inset-0">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,111,70,0.15),_transparent_60%)]" />
          <div className="pointer-events-none floating absolute left-10 top-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none floating absolute right-10 bottom-10 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="cursor-interactive rounded-full border border-border/40 bg-card/40 px-5 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-card/60 hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
            <div className="rounded-full bg-card/30 px-4 py-2 text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Secure Payment
            </div>
          </div>

          <div className="glass-panel neon-border rounded-3xl p-8 shadow-elegant">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary">
                <CreditCard className="h-10 w-10" />
              </div>
              <h1 className="text-3xl font-semibold text-foreground">Instruksi Pembayaran</h1>
              <p className="mt-3 text-muted-foreground">
                Selesaikan pembayaran Anda dengan transfer ke salah satu rekening berikut.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="glass-panel rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-foreground">Ringkasan Order</h2>
                <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>ID Pesanan</span>
                    <span className="font-mono text-base text-foreground">{paymentData.orderId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                      Menunggu Pembayaran
                    </span>
                  </div>
                  <div className="rounded-2xl bg-primary/10 px-4 py-5 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Total Pembayaran</p>
                    <p className="mt-2 text-3xl font-semibold text-primary">{formattedAmount}</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-foreground">Panduan Singkat</h2>
                <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li>1. Buka aplikasi mobile/Internet banking pilihan Anda.</li>
                  <li>2. Pilih menu transfer antar bank dan masukkan nomor rekening tujuan.</li>
                  <li>3. Nominal yang ditransfer harus sama dengan total pembayaran.</li>
                  <li>4. Pastikan nama penerima: <span className="font-semibold text-foreground">HAIKAL AKHALUL AZHAR</span>.</li>
                  <li>5. Simpan bukti transfer dan kirimkan ke tim kami jika diminta.</li>
                </ol>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-lg font-semibold text-foreground">Pilih Rekening Tujuan</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Anda dapat menggunakan salah satu rekening berikut; semua pembayaran akan diverifikasi otomatis dalam 1x24 jam kerja.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {bankAccounts.map((bank) => (
                  <div key={bank.id} className="glass-panel rounded-2xl border border-border/40 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{bank.bankName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">Atas Nama</p>
                        <p className="text-base font-semibold text-foreground">{bank.accountHolder}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-full text-xs font-semibold"
                        onClick={() => copyToClipboard(bank.bankName, `${bank.id}-bank`)}
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        {copied === `${bank.id}-bank` ? "Tersalin!" : "Bank"}
                      </Button>
                    </div>
                    <div className="mt-4 rounded-2xl bg-card/40 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">No. Rekening</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-mono text-xl font-semibold text-foreground">{bank.accountNumber}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-full text-xs font-semibold"
                          onClick={() => copyToClipboard(bank.accountNumber, `${bank.id}-number`)}
                        >
                          <Copy className="mr-1 h-3 w-3" />
                          {copied === `${bank.id}-number` ? "Tersalin!" : "Salin"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center text-sm text-emerald-50">
              <CheckCircle className="mx-auto mb-3 h-10 w-10 text-emerald-300" />
              <h3 className="text-xl font-semibold text-foreground">Konfirmasi Pembayaran</h3>
              <p className="mt-2 text-muted-foreground">
                Tim kami akan memverifikasi pembayaran Anda secara manual. Jika Anda membutuhkan bantuan, hubungi kami melalui WhatsApp setelah mengirim bukti transfer.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={() => copyToClipboard(amount || "", "total")}
                  variant="outline"
                  className="rounded-full border-primary/40 text-primary hover:bg-primary/20"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Salin Total
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  className="rounded-full bg-primary px-6"
                >
                  Kembali ke Beranda
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentInstructionsPage;
