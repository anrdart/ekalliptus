import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useInView } from "@/hooks/use-in-view";

type OrderFormValues = {
  nama: string;
  email: string;
  whatsapp: string;
  layanan: string;
  anggaran: string;
  deadline: string;
  deskripsi: string;
  lampiran?: FileList;
};

const layananOptions = [
  "Website Development",
  "WordPress Development",
  "Berdu Platform",
  "Mobile App Development",
  "Service HP & Laptop",
  "Photo & Video Editing",
];

const whatsappNumberEkal = "6281999900306";

function normalizeWhatsapp(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("8")) return "62" + digits;
  return digits || whatsappNumberEkal;
}

function buildMessage(values: OrderFormValues) {
  const userWa = normalizeWhatsapp(values.whatsapp);
  const lines = [
    "Halo ekalliptus, saya ingin order jasa.",
    `Nama: ${values.nama}`,
    `Email: ${values.email}`,
    `WhatsApp: ${userWa}`,
    `Jenis Layanan: ${values.layanan}`,
    `Anggaran: Rp ${values.anggaran}`,
    `Deadline: ${values.deadline}`,
    "Deskripsi:",
    values.deskripsi,
    values.lampiran && values.lampiran.length > 0 ? `Lampiran: ${values.lampiran[0].name}` : "Lampiran: (tidak ada)",
  ];
  return encodeURIComponent(lines.join("\n"));
}

const Order = () => {
  const { toast } = useToast();
  const form = useForm<OrderFormValues>({
    defaultValues: {
      nama: "",
      email: "",
      whatsapp: "",
      layanan: "",
      anggaran: "",
      deadline: "",
      deskripsi: "",
      lampiran: undefined,
    },
    mode: "onSubmit",
  });

  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  const fadeClass = useMemo(() => (inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"), [inView]);

  const onSubmit = async (values: OrderFormValues) => {
    // Always send to business number
    const phoneDest = whatsappNumberEkal;
    const waURL = `https://api.whatsapp.com/send?phone=${phoneDest}&text=${buildMessage(values)}`;
  
    // Open WhatsApp immediately to avoid popup blockers
    window.open(waURL, "_blank", "noopener,noreferrer");
  
    // Background log to Google Apps Script if configured
    const endpoint = import.meta.env.VITE_GAS_ENDPOINT;
  
    if (endpoint) {
      try {
        const json = JSON.stringify({
          timestamp: new Date().toISOString(),
          ...values,
          whatsappNormalized: normalizeWhatsapp(values.whatsapp),
          lampiranName: values.lampiran && values.lampiran.length > 0 ? values.lampiran[0].name : null,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        });
  
        // Prefer sendBeacon: avoids CORS/preflight and continues on navigation
        const beaconData = new Blob([json], { type: "text/plain;charset=UTF-8" });
        const beaconSent =
          typeof navigator !== "undefined" && "sendBeacon" in navigator
            ? navigator.sendBeacon(endpoint, beaconData)
            : false;
  
        // Fallback to fetch with no-cors + keepalive
        if (!beaconSent) {
          fetch(endpoint, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=UTF-8" },
            body: json,
            keepalive: true,
          }).catch(() => {
            // Non-blocking
          });
        }
      } catch {
        // Non-blocking
      }
    }
  
    toast({
      title: "Permintaan Order Terkirim",
      description: "Silakan lanjutkan percakapan di WhatsApp. Terima kasih!",
    });
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className={`text-center mb-10 transition-all duration-700 ease-smooth ${fadeClass}`} ref={ref}>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Order Jasa</h1>
          <p className="text-muted-foreground text-lg">
            Isi form berikut untuk memulai order jasa. Kami akan segera menghubungi Anda.
          </p>
        </div>

        <Card className={`bg-card-gradient border-border/50 shadow-elegant transition-all duration-700 ease-smooth ${fadeClass}`}>
          <CardHeader>
            <CardTitle>Form Order</CardTitle>
            <CardDescription>Lengkapi data dengan jelas agar proses berjalan cepat dan tepat.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6" noValidate>
                <FormField
                  control={form.control}
                  name="nama"
                  rules={{ required: "Nama wajib diisi" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Budi Santoso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: "Email wajib diisi",
                    pattern: {
                      value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i,
                      message: "Format email tidak valid",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="nama@domain.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsapp"
                  rules={{
                    required: "Nomor WhatsApp wajib diisi",
                    pattern: {
                      value: /^[+0-9\s()-]{9,20}$/i,
                      message: "Masukkan nomor WhatsApp yang valid",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Contoh: 0851xxxxxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="layanan"
                  rules={{ required: "Pilih jenis layanan" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Layanan</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih layanan" />
                          </SelectTrigger>
                          <SelectContent>
                            {layananOptions.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="anggaran"
                  rules={{
                    required: "Anggaran wajib diisi",
                    validate: (v) => {
                      const n = Number(String(v).replace(/[^\d]/g, ""));
                      if (Number.isNaN(n) || n <= 0) return "Masukkan angka yang valid";
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anggaran (Rp)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="Contoh: 5000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  rules={{ required: "Tanggal deadline wajib diisi" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deskripsi"
                  rules={{ required: "Deskripsi kebutuhan wajib diisi" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi Kebutuhan</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ceritakan detail kebutuhan Anda..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lampiran"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lampiran (opsional)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => field.onChange(e.target.files as FileList)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" variant="hero" className="px-8 py-6">Kirim via WhatsApp</Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      const v = form.getValues();
                      const subject = encodeURIComponent(`Order Jasa - ${v.layanan} - ${v.nama}`);
                      const body = buildMessage(v);
                      window.location.href = `mailto:ekalliptus@gmail.com?subject=${subject}&body=${body}`;
                    }}
                  >
                    Alternatif: Email
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Catatan: Lampiran tidak terkirim via WhatsApp/Email otomatis, sertakan saat chat jika diperlukan.
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Order;