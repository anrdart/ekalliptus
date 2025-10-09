import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useInView } from "@/hooks/use-in-view";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const SHEET_API_URL = "https://sheetdb.io/api/v1/4br025yd4lsm5";
const EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send";

type OrderFormValues = {
  nama: string;
  email: string;
  whatsapp: string;
  perusahaan: string;
  jabatan: string;
  website: string;
  layanan: string;
  scope: string[];
  anggaran: string;
  timeline: string;
  deadline: string;
  preferensiKontak: "whatsapp" | "email" | "meeting";
  zonaWaktu: string;
  tujuan: string;
  referensi: string;
  deskripsi: string;
  lampiran?: FileList;
};

const layananOptions = [
  "Website Corporate",
  "Landing Page",
  "E-Commerce / Catalog",
  "Web App / Dashboard",
  "Mobile App (Flutter/React Native)",
  "Maintenance & Optimization",
  "Branding & UI Kit",
];

const scopeOptions = [
  {
    value: "ux_research",
    label: "UX Research",
    description: "Audit, persona, customer journey, dan analisis kompetitor.",
  },
  {
    value: "ui_design",
    label: "UI Design",
    description: "Wireframe, high fidelity design, dan prototyping interaktif.",
  },
  {
    value: "web_development",
    label: "Web Development",
    description: "Implementasi front-end & back-end sesuai desain.",
  },
  {
    value: "content_copy",
    label: "Copywriting & Content",
    description: "Penulisan konten, struktur informasi, dan microcopy.",
  },
  {
    value: "branding_assets",
    label: "Brand Assets",
    description: "Logo, guideline visual, dan asset grafis pendukung.",
  },
  {
    value: "seo_performance",
    label: "SEO & Performance",
    description: "Optimasi kecepatan, aksesibilitas, dan visibilitas SEO.",
  },
];

const budgetOptions = [
  "< Rp 10.000.000",
  "Rp 10.000.000 - Rp 20.000.000",
  "Rp 20.000.000 - Rp 35.000.000",
  "Rp 35.000.000 - Rp 50.000.000",
  "> Rp 50.000.000",
  "Belum Menentukan",
];

const timelineOptions = [
  "Sesegera mungkin (1-2 minggu)",
  "Kurang dari 1 bulan",
  "1 - 2 bulan",
  "3 - 6 bulan",
  "Fleksibel / Diskusikan",
];

const contactPreferences = [
  { value: "whatsapp", label: "WhatsApp", helper: "Kami hubungi via nomor WhatsApp Anda." },
  { value: "email", label: "Email", helper: "Kirim update dan proposal melalui email." },
  { value: "meeting", label: "Meeting Online", helper: "Jadwalkan sesi meeting melalui Zoom/Meet." },
];

const timezoneOptions = [
  "WIB (GMT+7)",
  "WITA (GMT+8)",
  "WIT (GMT+9)",
  "GMT+7 (Bangkok / Jakarta)",
  "GMT+8 (Singapore)",
  "GMT+9 (Tokyo)",
  "GMT+10 (Sydney)",
  "Lainnya",
];

const whatsappNumberEkal = "6281999900306";

const emailConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  receiverEmail: import.meta.env.VITE_EMAILJS_RECEIVER ?? "ekalliptus@gmail.com",
};

function normalizeWhatsapp(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits || whatsappNumberEkal;
}

const summarizeScope = (scope: string[]) =>
  scope.length > 0 ? scope.map((item) => scopeOptions.find((opt) => opt.value === item)?.label ?? item).join(", ") : "-";

const Order = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentMeta, setAttachmentMeta] = useState<{ name: string; size: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<OrderFormValues>({
    defaultValues: {
      nama: "",
      email: "",
      whatsapp: "",
      perusahaan: "",
      jabatan: "",
      website: "",
      layanan: "",
      scope: [],
      anggaran: "",
      timeline: "",
      deadline: "",
      preferensiKontak: "whatsapp",
      zonaWaktu: "WIB (GMT+7)",
      tujuan: "",
      referensi: "",
      deskripsi: "",
      lampiran: undefined,
    },
    mode: "onSubmit",
  });

  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  const fadeClass = useMemo(() => (inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"), [inView]);

  const handleSheetSubmission = async (values: OrderFormValues) => {
    const record = {
      timestamp: new Date().toISOString(),
      nama: values.nama,
      email: values.email,
      whatsapp: normalizeWhatsapp(values.whatsapp),
      perusahaan: values.perusahaan || "-",
      jabatan: values.jabatan || "-",
      website: values.website || "-",
      layanan: values.layanan,
      scope: summarizeScope(values.scope),
      anggaran: values.anggaran,
      timeline: values.timeline,
      deadline: values.deadline,
      preferensi_kontak: values.preferensiKontak,
      zona_waktu: values.zonaWaktu,
      tujuan: values.tujuan,
      referensi: values.referensi || "-",
      deskripsi: values.deskripsi,
      lampiran: values.lampiran && values.lampiran.length > 0 ? values.lampiran[0].name : "-",
      status: "Baru",
    };

    const response = await fetch(SHEET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [record] }),
    });

    if (!response.ok) {
      throw new Error("SheetDB API tidak merespons dengan benar");
    }
  };

  const handleEmailNotification = async (values: OrderFormValues) => {
    if (!emailConfig.serviceId || !emailConfig.templateId || !emailConfig.publicKey) {
      return false;
    }

    const response = await fetch(EMAILJS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: emailConfig.serviceId,
        template_id: emailConfig.templateId,
        user_id: emailConfig.publicKey,
        accessToken: emailConfig.publicKey,
        template_params: {
          to_email: emailConfig.receiverEmail,
          nama: values.nama,
          email: values.email,
          whatsapp: normalizeWhatsapp(values.whatsapp),
          perusahaan: values.perusahaan || "-",
          jabatan: values.jabatan || "-",
          website: values.website || "-",
          layanan: values.layanan,
          scope: summarizeScope(values.scope),
          anggaran: values.anggaran,
          timeline: values.timeline,
          deadline: values.deadline,
          preferensiKontak: values.preferensiKontak,
          zonaWaktu: values.zonaWaktu,
          tujuan: values.tujuan,
          referensi: values.referensi || "-",
          deskripsi: values.deskripsi,
          lampiran: values.lampiran && values.lampiran.length > 0 ? values.lampiran[0].name : "-",
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Gagal mengirim notifikasi email");
    }

    return true;
  };

  const onSubmit = async (values: OrderFormValues) => {
    setIsSubmitting(true);
    try {
      await handleSheetSubmission(values);

      let emailWarning: string | null = null;
      try {
        const emailSent = await handleEmailNotification(values);
        if (!emailSent) {
          emailWarning =
            "Notifikasi email tidak dikirim karena konfigurasi EmailJS belum diset. Tambahkan variabel lingkungan untuk mengaktifkannya.";
        }
      } catch (error) {
        emailWarning =
          error instanceof Error
            ? `Data tersimpan, tetapi notifikasi email gagal: ${error.message}`
            : "Data tersimpan, tetapi notifikasi email gagal dikirim.";
      }

      form.reset();
      setAttachmentMeta(null);
      toast({
        title: "Order berhasil dikirim",
        description: emailWarning
          ? emailWarning
          : "Tim ekalliptus akan menghubungi Anda dalam waktu 24 jam. Terima kasih!",
      });
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan ketika menyimpan order. Silakan coba lagi.";

      toast({
        title: "Gagal mengirim order",
        description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="content-vis relative px-4 py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(135%_180%_at_50%_-45%,rgba(91,112,255,0.75)_0%,rgba(16,21,45,0.94)_60%,rgba(5,7,19,0.98)_78%,rgba(3,4,11,1)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(140%_140%_at_52%_125%,rgba(12,16,36,0.85)_10%,rgba(9,13,27,0.82)_46%,transparent_85%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[-14rem] h-[40rem] bg-[radial-gradient(90%_58%_at_50%_-18%,rgba(99,102,241,0.52)_0%,rgba(99,102,241,0)_76%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-12rem] h-[44rem] bg-[radial-gradient(88%_60%_at_50%_118%,rgba(6,182,212,0.4)_0%,rgba(6,182,212,0)_74%)]" />
      <div className="pointer-events-none absolute left-[12%] top-[18%] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(120,134,255,0.35)_0%,rgba(120,134,255,0)_70%)] blur-[80px]" />
      <div className="pointer-events-none absolute right-[16%] top-[22%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.28)_0%,rgba(6,182,212,0)_65%)] blur-[70px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className={`mb-14 text-center transition-all duration-700 ease-smooth ${fadeClass}`} ref={ref}>
          <div className="mx-auto flex w-max items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.6em] text-white/60">
            Formulir Order
          </div>
          <h1 className="mt-6 bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-300 bg-clip-text text-4xl font-semibold uppercase tracking-[0.4em] text-transparent md:text-5xl">
            Mulai Kolaborasi
          </h1>
          <p className="mt-6 text-base leading-relaxed text-white/70 md:text-lg">
            Ceritakan kebutuhan proyek Anda secara detail. Data akan otomatis masuk ke dashboard internal kami dan notifikasi email akan dikirim ke tim ekalliptus.
          </p>
        </div>

        <Card className={`glass-panel neon-border border-white/10 p-8 shadow-elegant transition-all duration-700 ease-smooth md:p-12 ${fadeClass}`}>
          <CardHeader className="space-y-3 px-0 pb-8">
            <CardTitle className="text-3xl font-semibold text-white">Detail Proyek</CardTitle>
            <CardDescription className="text-base text-white/65">
              Informasi yang Anda berikan membantu kami menyiapkan solusi paling relevan serta estimasi yang presisi.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8" noValidate>
                <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    name="perusahaan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Perusahaan / Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="Jika pribadi, kosongkan saja" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jabatan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jabatan / Peran</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Founder, Marketing Manager, UI Lead" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website / Platform Saat Ini</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: https://brandanda.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                <section className="space-y-6">
                  <FormField
                    control={form.control}
                    name="layanan"
                    rules={{ required: "Pilih jenis layanan" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Layanan Utama</FormLabel>
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
                    name="scope"
                    rules={{
                      validate: (value) => value.length > 0 || "Pilih minimal satu lingkup pekerjaan",
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lingkup Pekerjaan</FormLabel>
                        <div className="grid gap-3 md:grid-cols-2">
                          {scopeOptions.map((option) => {
                            const checked = field.value?.includes(option.value) ?? false;
                            return (
                              <Label
                                key={option.value}
                                className={cn(
                                  "cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:border-white/20 hover:bg-white/10",
                                  checked ? "border-sky-400/50 bg-white/10" : "",
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(isChecked) => {
                                      if (isChecked === true) {
                                        field.onChange([...(field.value ?? []), option.value]);
                                      } else {
                                        field.onChange((field.value ?? []).filter((item) => item !== option.value));
                                      }
                                    }}
                                  />
                                  <div>
                                    <p className="text-sm font-semibold text-white">{option.label}</p>
                                    <p className="text-xs text-white/60">{option.description}</p>
                                  </div>
                                </div>
                              </Label>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="anggaran"
                    rules={{ required: "Pilih rentang anggaran" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rentang Anggaran</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Perkirakan rentang anggaran" />
                            </SelectTrigger>
                            <SelectContent>
                              {budgetOptions.map((opt) => (
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
                    name="timeline"
                    rules={{ required: "Pilih estimasi timeline" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimasi Timeline</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Kapan proyek hendak dimulai?" />
                            </SelectTrigger>
                            <SelectContent>
                              {timelineOptions.map((opt) => (
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
                    name="deadline"
                    rules={{ required: "Tanggal target peluncuran wajib diisi" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Peluncuran</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zonaWaktu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zona Waktu</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih zona waktu Anda" />
                            </SelectTrigger>
                            <SelectContent>
                              {timezoneOptions.map((opt) => (
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
                </section>

                <section className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="preferensiKontak"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferensi Komunikasi</FormLabel>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="grid gap-3 md:grid-cols-3"
                        >
                          {contactPreferences.map((option) => (
                            <Label
                              key={option.value}
                              className={cn(
                                "flex cursor-pointer flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10",
                                field.value === option.value ? "border-sky-400/50 bg-white/10" : "",
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <RadioGroupItem value={option.value} className="h-5 w-5" />
                                <span className="text-sm font-semibold text-white">{option.label}</span>
                              </div>
                              <p className="text-xs text-white/60">{option.helper}</p>
                            </Label>
                          ))}
                        </RadioGroup>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                <section className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="tujuan"
                    rules={{ required: "Tujuan proyek wajib diisi" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tujuan Utama Proyek</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="Misal: meningkatkan konversi, memperbaiki brand perception, dsb." {...field} />
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
                        <FormLabel>Detail Kebutuhan</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={5}
                            placeholder="Ceritakan scope detail, referensi kompetitor, integrasi yang dibutuhkan, atau flow pengguna yang ingin ditingkatkan."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referensi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referensi / Moodboard (opsional)</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="Cantumkan link dribbble, behance, website favorit, atau catatan tambahan lainnya."
                            {...field}
                          />
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
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-2xl border border-white/20 bg-white/15 px-6 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-white backdrop-blur-2xl transition hover:border-sky-300/40 hover:bg-sky-500/25"
                              >
                                Pilih File
                              </button>
                              <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 backdrop-blur-2xl">
                                {attachmentMeta ? (
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="truncate font-medium text-white/85">{attachmentMeta.name}</span>
                                    <span className="text-xs text-white/50">{attachmentMeta.size} KB</span>
                                  </div>
                                ) : (
                                  <span className="text-xs uppercase tracking-[0.32em] text-white/40">Belum ada file dipilih</span>
                                )}
                              </div>
                            </div>
                            <Input
                              ref={fileInputRef}
                              type="file"
                              className="sr-only"
                              onChange={(e) => {
                                const files = e.target.files as FileList;
                                field.onChange(files);
                                const file = files && files.length > 0 ? files[0] : null;
                                setAttachmentMeta(file ? { name: file.name, size: Math.max(1, Math.round(file.size / 1024)) } : null);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                  <div className="flex items-center gap-3 text-white">
                    <span className="text-xs uppercase tracking-[0.4em] text-white/40">Catatan</span>
                    <div className="h-px flex-1 bg-white/15" />
                  </div>
                  <p>
                    Dokumen langsung tersinkron ke Sheet internal ekalliptus. Jika ingin mengirim lampiran tambahan (wireframe,
                    requirement, dsb), balas email konfirmasi yang Anda terima setelah pengiriman formulir ini.
                  </p>
                  <p className="text-xs text-white/50">
                    Kami menjaga kerahasiaan data Anda dan hanya menggunakan informasi ini untuk keperluan komunikasi proyek.
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full rounded-full px-8 py-6 text-sm font-semibold uppercase tracking-wide sm:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim Order"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-full border-white/15 bg-white/5 px-6 py-6 text-sm font-semibold text-white/80 hover:border-white/30 hover:bg-white/10 sm:w-auto"
                    onClick={() => {
                      form.reset();
                      setAttachmentMeta(null);
                    }}
                    disabled={isSubmitting}
                  >
                    Reset Form
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Order;
