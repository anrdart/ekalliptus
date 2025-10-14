import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useInView } from "@/hooks/use-in-view";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SEO_CONFIG, getCanonicalUrl, getOgUrl, PAGE_SEO } from "@/config/seo.config";

const SHEET_API_URL = "https://sheetdb.io/api/v1/4br025yd4lsm5";
const EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send";

const layananOptions = [
  "Website Development",
  "WordPress Development",
  "Berdu Platform",
  "Mobile App Development",
  "Service HP & Laptop",
  "Photo & Video Editing",
] as const;

const layananKeyMap = {
  "Website Development": "websiteDevelopment",
  "WordPress Development": "wordpressDevelopment",
  "Berdu Platform": "berduPlatform",
  "Mobile App Development": "mobileAppDevelopment",
  "Service HP & Laptop": "serviceHpLaptop",
  "Photo & Video Editing": "photoVideoEditing",
} as const;

type LayananOption = (typeof layananOptions)[number];
type ServiceKey = (typeof layananKeyMap)[LayananOption];

type ServiceDetails = {
  websiteDevelopment: {
    namaBisnisBrand: string;
    jenisBisnis: string;
    tujuanWebsite: string;
    preferensiDesainWarna: string;
    domainDiinginkan: string;
    fiturKhusus: string;
    budgetEstimasiWaktu: string;
    kontakDapatDihubungi: string;
    catatanTambahan: string;
  };
  wordpressDevelopment: {
    namaBrandSitus: string;
    jenisWebsite: string;
    pilihanTema: string;
    kebutuhanPlugin: string;
    kontenAwal: string;
    akunAdmin: string;
    budgetDeadline: string;
    catatanTambahan: string;
  };
  berduPlatform: {
    namaBisnis: string;
    jenisUsaha: string;
    jumlahUserKelola: string;
    kebutuhanFiturDashboard: string;
    jenisDataAnalytics: string;
    preferensiIntegrasi: string;
    kontakPic: string;
    catatanTambahan: string;
  };
  mobileAppDevelopment: {
    namaAplikasi: string;
    platformTarget: string;
    tujuanAplikasi: string;
    fiturUtama: string;
    mockupDesain: string;
    integrasiLayanan: string;
    estimasiJumlahPengguna: string;
    kontak: string;
    catatanTambahan: string;
  };
  serviceHpLaptop: {
    namaLengkap: string;
    jenisPerangkat: string;
    masalahUtama: string;
    informasiGaransi: string;
    pilihanLayanan: string;
    lokasiLayanan: string;
    kontak: string;
    catatanTambahan: string;
  };
  photoVideoEditing: {
    namaProyek: string;
    jenisEditing: string;
    jumlahFile: string;
    kebutuhanSpesifik: string;
    resolusiFormatOutput: string;
    deadline: string;
    kontak: string;
    catatanTambahan: string;
  };
};

type ServiceFieldPath = {
  [K in ServiceKey]: `layananDetails.${K}.${keyof ServiceDetails[K] & string}`;
}[ServiceKey];

const toServiceKey = (layanan: string): ServiceKey | undefined =>
  (layananKeyMap as Record<string, ServiceKey | undefined>)[layanan];

type ServiceFieldConfig<K extends ServiceKey> = {
  name: keyof ServiceDetails[K];
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  textarea?: boolean;
};

const serviceFieldConfigs: { [K in ServiceKey]: ServiceFieldConfig<K>[] } = {
  websiteDevelopment: [
    {
      name: "namaBisnisBrand",
      label: "Nama bisnis/brand",
      placeholder: "Contoh: Ekalliptus Studio",
    },
    {
      name: "jenisBisnis",
      label: "Jenis bisnis",
      placeholder: "Contoh: Agency kreatif, UMKM kuliner, SaaS, dll",
    },
    {
      name: "tujuanWebsite",
      label: "Tujuan website",
      placeholder: "Informasi perusahaan, e-commerce, company profile, platform reservasi, dll",
      textarea: true,
    },
    {
      name: "preferensiDesainWarna",
      label: "Preferensi desain/warna",
      placeholder: "Sebutkan gaya visual atau palet warna yang diinginkan",
      textarea: true,
      required: false,
    },
    {
      name: "domainDiinginkan",
      label: "Domain yang diinginkan",
      placeholder: "Contoh: ekalliptus.id",
      required: false,
    },
    {
      name: "fiturKhusus",
      label: "Fitur khusus",
      placeholder: "Blog, galeri, form kontak, booking, multi bahasa, dsb",
      textarea: true,
      required: false,
    },
    {
      name: "budgetEstimasiWaktu",
      label: "Budget/estimasi waktu",
      placeholder: "Perkirakan budget & target waktu penyelesaian",
    },
    {
      name: "kontakDapatDihubungi",
      label: "Kontak yang dapat dihubungi",
      placeholder: "Nama & nomor/akun yang nyaman dihubungi",
    },
    {
      name: "catatanTambahan",
      label: "Catatan tambahan / referensi (opsional)",
      placeholder: "Tambahkan link referensi, moodboard, atau catatan khusus lainnya.",
      textarea: true,
      required: false,
    },
  ],
  wordpressDevelopment: [
    {
      name: "namaBrandSitus",
      label: "Nama/brand situs",
      placeholder: "Contoh: Ekalliptus Blog",
    },
    {
      name: "jenisWebsite",
      label: "Jenis website",
      placeholder: "Blog, toko online, edukasi, portfolio, katalog produk, dll",
    },
    {
      name: "pilihanTema",
      label: "Pilihan tema",
      placeholder: "Custom design atau rekomendasi tema yang disukai",
      textarea: true,
    },
    {
      name: "kebutuhanPlugin",
      label: "Kebutuhan plugin",
      placeholder: "E-commerce, SEO, membership, LMS, automasi, dsb",
      textarea: true,
    },
    {
      name: "kontenAwal",
      label: "Konten awal",
      placeholder: "Artikel, kategori produk, data produk, asset visual, dsb",
      textarea: true,
      required: false,
    },
    {
      name: "akunAdmin",
      label: "Akun admin",
      placeholder: "Informasi akun admin yang dibutuhkan atau struktur akses",
      textarea: true,
    },
    {
      name: "budgetDeadline",
      label: "Budget & deadline",
      placeholder: "Estimasikan budget dan target live",
    },
    {
      name: "catatanTambahan",
      label: "Catatan tambahan / referensi (opsional)",
      placeholder: "Cantumkan akses staging, asset branding, atau kebutuhan khusus lainnya.",
      textarea: true,
      required: false,
    },
  ],
  berduPlatform: [
    {
      name: "namaBisnis",
      label: "Nama bisnis",
      placeholder: "Contoh: Ekalliptus Ventures",
    },
    {
      name: "jenisUsaha",
      label: "Jenis usaha",
      placeholder: "Retail, layanan, distribusi, reseller, dsb",
    },
    {
      name: "jumlahUserKelola",
      label: "Jumlah user yang akan dikelola",
      placeholder: "Berapa banyak admin/agen/operator yang akan menggunakan sistem",
    },
    {
      name: "kebutuhanFiturDashboard",
      label: "Kebutuhan fitur dashboard admin",
      placeholder: "Contoh: manajemen order, stok, user role, laporan, dsb",
      textarea: true,
    },
    {
      name: "jenisDataAnalytics",
      label: "Jenis data bisnis/analytics yang diinginkan",
      placeholder: "Sebutkan KPI utama, laporan atau analitik yang perlu tersedia",
      textarea: true,
      required: false,
    },
    {
      name: "preferensiIntegrasi",
      label: "Preferensi integrasi",
      placeholder: "Integrasi ke penyimpanan cloud, marketplace, payment gateway, dll",
      textarea: true,
      required: false,
    },
    {
      name: "kontakPic",
      label: "Kontak PIC",
      placeholder: "Nama penanggung jawab & kontaknya",
    },
    {
      name: "catatanTambahan",
      label: "Catatan tambahan (opsional)",
      placeholder: "Tambahkan SOP, integrasi prioritas, atau catatan implementasi lainnya.",
      textarea: true,
      required: false,
    },
  ],
  mobileAppDevelopment: [
    {
      name: "namaAplikasi",
      label: "Nama aplikasi",
      placeholder: "Contoh: Ekalliptus Mobile",
    },
    {
      name: "platformTarget",
      label: "Platform target",
      placeholder: "Android, iOS, atau keduanya",
    },
    {
      name: "tujuanAplikasi",
      label: "Tujuan aplikasi",
      placeholder: "Bisnis, edukasi, komunitas, internal tools, dsb",
      textarea: true,
    },
    {
      name: "fiturUtama",
      label: "Fitur utama yang diinginkan",
      placeholder: "Minimal 3 fitur inti yang harus tersedia",
      textarea: true,
    },
    {
      name: "mockupDesain",
      label: "Mockup/desain awal (opsional)",
      placeholder: "Cantumkan link figma, gambar, atau catatan desain jika ada",
      textarea: true,
      required: false,
    },
    {
      name: "integrasiLayanan",
      label: "Integrasi dengan layanan lain atau API",
      placeholder: "Contoh: payment gateway, CRM, sistem internal, dsb",
      textarea: true,
      required: false,
    },
    {
      name: "estimasiJumlahPengguna",
      label: "Estimasi jumlah pengguna",
      placeholder: "Perkirakan jumlah user aktif dalam 3-6 bulan pertama",
    },
    {
      name: "kontak",
      label: "Kontak",
      placeholder: "Nama & nomor/email PIC proyek",
    },
    {
      name: "catatanTambahan",
      label: "Catatan tambahan (opsional)",
      placeholder: "Lampirkan referensi desain, repo existing, atau catatan scope lainnya.",
      textarea: true,
      required: false,
    },
  ],
  serviceHpLaptop: [
    {
      name: "namaLengkap",
      label: "Nama lengkap",
      placeholder: "Contoh: Budi Santoso",
    },
    {
      name: "jenisPerangkat",
      label: "Jenis perangkat",
      placeholder: "HP/Laptop, merk, dan tipe",
    },
    {
      name: "masalahUtama",
      label: "Masalah/kendala utama",
      placeholder: "Contoh: layar blank, baterai drop, install ulang OS, dsb",
      textarea: true,
    },
    {
      name: "informasiGaransi",
      label: "Informasi garansi/suku cadang",
      placeholder: "Masih bergaransi, ingin pakai sparepart original/opsi lain",
      textarea: true,
      required: false,
    },
    {
      name: "pilihanLayanan",
      label: "Pilihan layanan",
      placeholder: "Hardware, software, upgrade, konsultasi, dsb",
    },
    {
      name: "lokasiLayanan",
      label: "Lokasi/area layanan",
      placeholder: "Contoh: Jakarta Timur, Bekasi, on-site/antar jemput",
    },
    {
      name: "kontak",
      label: "Kontak yang bisa dihubungi",
      placeholder: "Nomor telepon/WhatsApp alternatif",
    },
    {
      name: "catatanTambahan",
      label: "Catatan tambahan (opsional)",
      placeholder: "Tuliskan catatan servis lain, riwayat perbaikan, atau permintaan khusus.",
      textarea: true,
      required: false,
    },
  ],
  photoVideoEditing: [
    {
      name: "namaProyek",
      label: "Nama proyek",
      placeholder: "Contoh: Campaign Ramadan 2024",
    },
    {
      name: "jenisEditing",
      label: "Jenis editing",
      placeholder: "Foto, video, reels, long-form, dokumentasi, dsb",
    },
    {
      name: "jumlahFile",
      label: "Jumlah file yang akan diedit",
      placeholder: "Sebutkan jumlah file dan durasi/ukuran bila relevan",
    },
    {
      name: "kebutuhanSpesifik",
      label: "Kebutuhan spesifik",
      placeholder: "Color grading, motion graphic, audio mixing, subtitle, dsb",
      textarea: true,
    },
    {
      name: "resolusiFormatOutput",
      label: "Resolusi/format output",
      placeholder: "Contoh: 4K, MP4, JPG, PNG, rasio tertentu",
    },
    {
      name: "deadline",
      label: "Deadline",
      placeholder: "Sebutkan target tanggal atau rentang waktu",
    },
    {
      name: "kontak",
      label: "Kontak",
      placeholder: "PIC proyek yang dapat dihubungi",
    },
    {
      name: "catatanTambahan",
      label: "Catatan tambahan / referensi (opsional)",
      placeholder: "Tambahkan link folder asset, moodboard, atau catatan revisi.",
      textarea: true,
      required: false,
    },
  ],
};

const emptyServiceDetails: ServiceDetails = {
  websiteDevelopment: {
    namaBisnisBrand: "",
    jenisBisnis: "",
    tujuanWebsite: "",
    preferensiDesainWarna: "",
    domainDiinginkan: "",
    fiturKhusus: "",
    budgetEstimasiWaktu: "",
    kontakDapatDihubungi: "",
    catatanTambahan: "",
  },
  wordpressDevelopment: {
    namaBrandSitus: "",
    jenisWebsite: "",
    pilihanTema: "",
    kebutuhanPlugin: "",
    kontenAwal: "",
    akunAdmin: "",
    budgetDeadline: "",
    catatanTambahan: "",
  },
  berduPlatform: {
    namaBisnis: "",
    jenisUsaha: "",
    jumlahUserKelola: "",
    kebutuhanFiturDashboard: "",
    jenisDataAnalytics: "",
    preferensiIntegrasi: "",
    kontakPic: "",
    catatanTambahan: "",
  },
  mobileAppDevelopment: {
    namaAplikasi: "",
    platformTarget: "",
    tujuanAplikasi: "",
    fiturUtama: "",
    mockupDesain: "",
    integrasiLayanan: "",
    estimasiJumlahPengguna: "",
    kontak: "",
    catatanTambahan: "",
  },
  serviceHpLaptop: {
    namaLengkap: "",
    jenisPerangkat: "",
    masalahUtama: "",
    informasiGaransi: "",
    pilihanLayanan: "",
    lokasiLayanan: "",
    kontak: "",
    catatanTambahan: "",
  },
  photoVideoEditing: {
    namaProyek: "",
    jenisEditing: "",
    jumlahFile: "",
    kebutuhanSpesifik: "",
    resolusiFormatOutput: "",
    deadline: "",
    kontak: "",
    catatanTambahan: "",
  },
};

const createEmptyServiceDetails = (): ServiceDetails =>
  JSON.parse(JSON.stringify(emptyServiceDetails)) as ServiceDetails;

type OrderFormValues = {
  nama: string;
  email: string;
  whatsapp: string;
  layanan: string;
  preferensiKontak: "whatsapp" | "email" | "meeting";
  lampiran?: FileList;
  layananDetails: ServiceDetails;
};

const getDefaultFormValues = (): OrderFormValues => ({
  nama: "",
  email: "",
  whatsapp: "",
  layanan: "",
  preferensiKontak: "whatsapp",
  lampiran: undefined,
  layananDetails: createEmptyServiceDetails(),
});


const contactPreferences = [
  { value: "whatsapp", label: "WhatsApp", helper: "Kami hubungi via nomor WhatsApp Anda." },
  { value: "email", label: "Email", helper: "Kirim update dan proposal melalui email." },
  { value: "meeting", label: "Meeting Online", helper: "Jadwalkan sesi meeting melalui Zoom/Meet." },
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

const summarizeServiceDetails = (serviceKey: ServiceKey, details?: Partial<ServiceDetails[ServiceKey]>) =>
  serviceFieldConfigs[serviceKey]
    .map((fieldConfig) => {
      const rawValue = details?.[fieldConfig.name] ?? "";
      const value = typeof rawValue === "string" ? rawValue.trim() : "";
      return `${fieldConfig.label}: ${value.length > 0 ? value : "-"}`;
    })
    .join("\n");

type SubmissionSummary = {
  perusahaan: string;
  jabatan: string;
  website: string;
  scope: string;
  anggaran: string;
  timeline: string;
  deadline: string;
  zonaWaktu: string;
  tujuan: string;
  referensi: string;
  deskripsi: string;
};

const emptySubmissionSummary: SubmissionSummary = {
  perusahaan: "-",
  jabatan: "-",
  website: "-",
  scope: "-",
  anggaran: "-",
  timeline: "-",
  deadline: "-",
  zonaWaktu: "-",
  tujuan: "-",
  referensi: "-",
  deskripsi: "-",
};

const trimOrDash = (value?: string) => {
  if (!value) return "-";
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "-";
};

const combineOrDash = (...values: (string | undefined)[]) => {
  const combined = values
    .map((value) => trimOrDash(value))
    .filter((value) => value !== "-")
    .join(" | ");
  return combined.length > 0 ? combined : "-";
};

const submissionMappers: { [K in ServiceKey]: (details: ServiceDetails[K]) => SubmissionSummary } = {
  websiteDevelopment: (details) => ({
    perusahaan: trimOrDash(details.namaBisnisBrand),
    jabatan: trimOrDash(details.kontakDapatDihubungi),
    website: trimOrDash(details.domainDiinginkan),
    scope: combineOrDash(details.jenisBisnis, details.fiturKhusus),
    anggaran: trimOrDash(details.budgetEstimasiWaktu),
    timeline: "-",
    deadline: "-",
    zonaWaktu: "-",
    tujuan: trimOrDash(details.tujuanWebsite),
    referensi: trimOrDash(details.catatanTambahan),
    deskripsi: combineOrDash(details.preferensiDesainWarna, details.fiturKhusus),
  }),
  wordpressDevelopment: (details) => ({
    perusahaan: trimOrDash(details.namaBrandSitus),
    jabatan: trimOrDash(details.akunAdmin),
    website: trimOrDash(details.jenisWebsite),
    scope: combineOrDash(details.pilihanTema, details.kontenAwal),
    anggaran: trimOrDash(details.budgetDeadline),
    timeline: trimOrDash(details.budgetDeadline),
    deadline: trimOrDash(details.budgetDeadline),
    zonaWaktu: "-",
    tujuan: trimOrDash(details.kebutuhanPlugin),
    referensi: trimOrDash(details.catatanTambahan),
    deskripsi: combineOrDash(details.pilihanTema, details.kontenAwal),
  }),
  berduPlatform: (details) => ({
    perusahaan: trimOrDash(details.namaBisnis),
    jabatan: trimOrDash(details.kontakPic),
    website: trimOrDash(details.jenisUsaha),
    scope: combineOrDash(details.kebutuhanFiturDashboard, details.preferensiIntegrasi),
    anggaran: "-",
    timeline: "-",
    deadline: "-",
    zonaWaktu: "-",
    tujuan: trimOrDash(details.kebutuhanFiturDashboard),
    referensi: trimOrDash(details.catatanTambahan),
    deskripsi: combineOrDash(details.jenisDataAnalytics, details.preferensiIntegrasi),
  }),
  mobileAppDevelopment: (details) => ({
    perusahaan: trimOrDash(details.namaAplikasi),
    jabatan: trimOrDash(details.kontak),
    website: trimOrDash(details.platformTarget),
    scope: combineOrDash(details.fiturUtama, details.integrasiLayanan),
    anggaran: "-",
    timeline: "-",
    deadline: "-",
    zonaWaktu: "-",
    tujuan: trimOrDash(details.tujuanAplikasi),
    referensi: trimOrDash(details.catatanTambahan),
    deskripsi: combineOrDash(details.mockupDesain, details.integrasiLayanan, details.estimasiJumlahPengguna),
  }),
  serviceHpLaptop: (details) => ({
    perusahaan: trimOrDash(details.jenisPerangkat),
    jabatan: trimOrDash(details.kontak),
    website: "-",
    scope: combineOrDash(details.pilihanLayanan),
    anggaran: "-",
    timeline: "-",
    deadline: "-",
    zonaWaktu: "-",
    tujuan: trimOrDash(details.masalahUtama),
    referensi: trimOrDash(details.catatanTambahan),
    deskripsi: combineOrDash(details.informasiGaransi, details.lokasiLayanan),
  }),
  photoVideoEditing: (details) => ({
    perusahaan: trimOrDash(details.namaProyek),
    jabatan: trimOrDash(details.kontak),
    website: trimOrDash(details.jenisEditing),
    scope: combineOrDash(details.jenisEditing, details.kebutuhanSpesifik),
    anggaran: "-",
    timeline: "-",
    deadline: trimOrDash(details.deadline),
    zonaWaktu: "-",
    tujuan: trimOrDash(details.kebutuhanSpesifik),
    referensi: trimOrDash(details.catatanTambahan),
    deskripsi: combineOrDash(details.resolusiFormatOutput, details.jumlahFile),
  }),
};

const deriveSubmissionSummary = <K extends ServiceKey>(
  serviceKey: K | undefined,
  details?: ServiceDetails[K],
): SubmissionSummary => {
  if (!serviceKey || !details) {
    return emptySubmissionSummary;
  }
  return submissionMappers[serviceKey](details);
};

const Order = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentMeta, setAttachmentMeta] = useState<{ name: string; size: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<OrderFormValues>({
    defaultValues: getDefaultFormValues(),
    mode: "onSubmit",
    shouldUnregister: true,
  });

  const selectedLayanan = form.watch("layanan");
  const selectedServiceKey = selectedLayanan ? toServiceKey(selectedLayanan) : undefined;
  const serviceSpecificFields = selectedServiceKey ? serviceFieldConfigs[selectedServiceKey] : [];

  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  const fadeClass = useMemo(() => (inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"), [inView]);

  const handleSheetSubmission = async (values: OrderFormValues) => {
    const serviceKey = toServiceKey(values.layanan ?? "");
    const layananDetail = serviceKey ? summarizeServiceDetails(serviceKey, values.layananDetails[serviceKey]) : "-";
    const submissionSummary = deriveSubmissionSummary(serviceKey, serviceKey ? values.layananDetails[serviceKey] : undefined);

    const record = {
      timestamp: new Date().toISOString(),
      nama: values.nama,
      email: values.email,
      whatsapp: normalizeWhatsapp(values.whatsapp),
      perusahaan: submissionSummary.perusahaan,
      jabatan: submissionSummary.jabatan,
      website: submissionSummary.website,
      layanan: values.layanan,
      scope: submissionSummary.scope,
      anggaran: submissionSummary.anggaran,
      timeline: submissionSummary.timeline,
      deadline: submissionSummary.deadline,
      preferensi_kontak: values.preferensiKontak,
      zona_waktu: submissionSummary.zonaWaktu,
      tujuan: submissionSummary.tujuan,
      referensi: submissionSummary.referensi,
      deskripsi: submissionSummary.deskripsi,
      detail_layanan: layananDetail,
      lampiran: values.lampiran && values.lampiran.length > 0 ? values.lampiran[0].name : "-",
      status: "Baru",
    };

    const response = await fetch(SHEET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [record] }),
    });

    if (!response.ok) {
      let errorMessage = "SheetDB API tidak merespons dengan benar";
      try {
        const errorBody = await response.json();
        if (errorBody?.error) {
          errorMessage = `SheetDB: ${errorBody.error}`;
        }
      } catch {
        const fallbackText = await response.text();
        if (fallbackText) {
          errorMessage = `SheetDB: ${fallbackText}`;
        }
      }
      throw new Error(errorMessage);
    }
  };

  const handleEmailNotification = async (values: OrderFormValues) => {
    if (!emailConfig.serviceId || !emailConfig.templateId || !emailConfig.publicKey) {
      return false;
    }

    const serviceKey = toServiceKey(values.layanan ?? "");
    const layananDetail = serviceKey ? summarizeServiceDetails(serviceKey, values.layananDetails[serviceKey]) : "-";
    const submissionSummary = deriveSubmissionSummary(serviceKey, serviceKey ? values.layananDetails[serviceKey] : undefined);

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
          perusahaan: submissionSummary.perusahaan,
          jabatan: submissionSummary.jabatan,
          website: submissionSummary.website,
          layanan: values.layanan,
          scope: submissionSummary.scope,
          anggaran: submissionSummary.anggaran,
          timeline: submissionSummary.timeline,
          deadline: submissionSummary.deadline,
          preferensiKontak: values.preferensiKontak,
          zonaWaktu: submissionSummary.zonaWaktu,
          tujuan: submissionSummary.tujuan,
          referensi: submissionSummary.referensi,
          deskripsi: submissionSummary.deskripsi,
          detail_layanan: layananDetail,
          lampiran: values.lampiran && values.lampiran.length > 0 ? values.lampiran[0].name : "-",
        },
      }),
    });

    if (!response.ok) {
      let errorMessage = "Gagal mengirim notifikasi email";
      try {
        const errorBody = await response.json();
        if (errorBody?.error) {
          errorMessage = `EmailJS: ${errorBody.error}`;
        }
      } catch {
        const fallbackText = await response.text();
        if (fallbackText) {
          errorMessage = `EmailJS: ${fallbackText}`;
        }
      }
      throw new Error(errorMessage);
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

      form.reset(getDefaultFormValues());
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
    <>
      <Helmet>
        <title>{PAGE_SEO.order.title}</title>
        <meta name="description" content={PAGE_SEO.order.description} />
        <meta name="keywords" content={PAGE_SEO.order.keywords} />
        <link rel="canonical" href={getCanonicalUrl(PAGE_SEO.order.path)} />
        <meta property="og:title" content="Order Layanan - ekalliptus | Website & Mobile App Development" />
        <meta property="og:description" content="Mulai proyek digital Anda dengan ekalliptus. Form order untuk website development Indonesia, WordPress custom, mobile app, dan layanan multimedia profesional." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getOgUrl(PAGE_SEO.order.path)} />
        <meta property="og:image" content="/assets/hero-bg.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Order Layanan - ekalliptus" />
        <meta name="twitter:description" content="Form order website development Indonesia, WordPress custom Jakarta, mobile app development, dan layanan digital profesional" />
        <meta name="twitter:image" content="/assets/hero-bg.jpg" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": getCanonicalUrl("/")
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Order Layanan",
                "item": getCanonicalUrl(PAGE_SEO.order.path)
              }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Order Layanan - ekalliptus",
            "description": "Form order layanan ekalliptus untuk website development, WordPress, mobile app, dan layanan digital profesional",
            "url": getCanonicalUrl(PAGE_SEO.order.path),
            "inLanguage": "id",
            "isPartOf": {
              "@type": "WebSite",
              "name": "ekalliptus",
              "url": getCanonicalUrl("/")
            },
            "potentialAction": {
              "@type": "OrderAction",
              "target": getCanonicalUrl(PAGE_SEO.order.path)
            }
          })}
        </script>
      </Helmet>
      <section className="content-vis relative px-4 py-24">

        <div className="relative z-10 mx-auto max-w-5xl">
          <div className={`mb-14 text-center transition-all duration-700 ease-smooth ${fadeClass}`} ref={ref}>
            <div className="mx-auto flex w-max items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.6em] text-white/60">
              Formulir Order
            </div>
            <h1 className="mt-6 bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-300 bg-clip-text text-4xl font-semibold uppercase tracking-[0.4em] text-transparent md:text-5xl">
              Order Layanan Digital
            </h1>
            <p className="mt-6 text-base leading-relaxed text-white/70 md:text-lg">
              Ceritakan kebutuhan proyek website development Indonesia, WordPress custom Jakarta, mobile app development, atau layanan digital lainnya secara detail. Data akan otomatis masuk ke dashboard internal kami dan notifikasi email akan dikirim ke tim ekalliptus untuk memberikan proposal dalam 24 jam.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Kami melayani berbagai kebutuhan digital: jasa pembuatan website Indonesia, WordPress custom Jakarta, mobile app development untuk Android dan iOS, service HP laptop profesional, serta editing foto video berkualitas tinggi. Pilih layanan yang sesuai dan isi form di bawah ini.
            </p>
          </div>

          <Card className={`glass-panel neon-border border-white/10 p-8 shadow-elegant transition-all duration-700 ease-smooth md:p-12 ${fadeClass}`}>
            <CardHeader className="space-y-3 px-0 pb-8">
              <CardTitle className="text-3xl font-semibold text-white">Detail Proyek</CardTitle>
              <CardDescription className="text-base text-white/65">
                Informasi yang Anda berikan membantu kami menyiapkan solusi paling relevan serta estimasi yang presisi untuk website development Indonesia, WordPress custom Jakarta, mobile app development, atau layanan digital lainnya.
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

                  </section>

                  <section className="space-y-6">
                    <FormField
                      control={form.control}
                      name="layanan"
                      rules={{ required: "Pilih jenis layanan" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Layanan Utama</FormLabel>
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

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-inner">
                      <div className="flex flex-col gap-2 pb-4 text-white">
                        <h3 className="text-lg font-semibold">Detail Layanan</h3>
                        <p className="text-sm text-white/60">
                          Isi kebutuhan spesifik sesuai layanan website development Indonesia, WordPress custom Jakarta, mobile app development, service HP laptop, atau editing foto video agar tim kami dapat meninjau dengan cepat dan akurat.
                        </p>
                      </div>

                      {selectedServiceKey && serviceSpecificFields.length > 0 ? (
                        <div className="grid grid-cols-1 gap-5">
                          {serviceSpecificFields.map((serviceField) => {
                            const fieldPath = `layananDetails.${selectedServiceKey}.${String(serviceField.name)}` as ServiceFieldPath;
                            const isRequired = serviceField.required !== false;
                            return (
                              <FormField
                                key={fieldPath}
                                control={form.control}
                                name={fieldPath}
                                rules={
                                  isRequired
                                    ? {
                                        required: `${serviceField.label} wajib diisi`,
                                      }
                                    : undefined
                                }
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="flex items-center justify-between gap-2">
                                      <FormLabel className="text-sm font-semibold text-white">
                                        {serviceField.label}
                                      </FormLabel>
                                      {!isRequired && (
                                        <span className="text-xs uppercase tracking-[0.3em] text-white/40">Opsional</span>
                                      )}
                                    </div>
                                    <FormControl>
                                      {serviceField.textarea ? (
                                        <Textarea
                                          rows={3}
                                          placeholder={serviceField.placeholder}
                                          {...field}
                                        />
                                      ) : (
                                        <Input placeholder={serviceField.placeholder} {...field} />
                                      )}
                                    </FormControl>
                                    {serviceField.description ? (
                                      <p className="text-xs text-white/50">{serviceField.description}</p>
                                    ) : null}
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/15 bg-white/0 p-6 text-sm text-white/55">
                          Pilih layanan website development Indonesia, WordPress custom Jakarta, mobile app development, service HP laptop, atau editing foto video terlebih dahulu untuk menampilkan form rinci sesuai kebutuhan proyek Anda.
                        </div>
                      )}
                    </div>

                  </section>
                  <section className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="preferensiKontak"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferensi Komunikasi</FormLabel>
                          <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3 md:grid-cols-3">
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
                                  setAttachmentMeta(
                                    file ? { name: file.name, size: Math.max(1, Math.round(file.size / 1024)) } : null,
                                  );
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
                      Dokumen langsung tersinkron ke Sheet internal ekalliptus untuk website development Indonesia, WordPress custom Jakarta, mobile app development, service HP laptop, dan editing foto video. Jika ingin mengirim lampiran tambahan (wireframe, requirement, dsb), balas email konfirmasi yang Anda terima setelah pengiriman formulir ini.
                    </p>
                    <p className="text-xs text-white/50">
                      Kami menjaga kerahasiaan data Anda dan hanya menggunakan informasi ini untuk keperluan komunikasi proyek website development, WordPress custom, mobile app, dan layanan digital lainnya.
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
                        form.reset(getDefaultFormValues());
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
    </>
  );
};

export default Order;
