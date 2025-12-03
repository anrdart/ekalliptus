'use client';

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getCanonicalUrl, getOgUrl } from '@/config/seo.config';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';

// Lazy load Supabase API to prevent blocking
let supabasePaymentApi: any = null;
const loadSupabaseApi = async () => {
  if (!supabasePaymentApi) {
    try {
      const module = await import('@/services/supabasePaymentApi');
      supabasePaymentApi = module.supabasePaymentApi;
    } catch (error) {
      console.error('Failed to load Supabase API:', error);
      // Fallback mock for development
      supabasePaymentApi = {
        createOrUpdateOrder: async (data: any) => ({ success: true, data }),
        createOrUpdateCustomer: async (data: any) => ({ success: true, data }),
        createTransaction: async (data: any) => ({ success: true, data }),
      };
    }
  }
  return supabasePaymentApi;
};

const layananOptions = [
  { key: 'websiteDevelopment', value: 'Website Development' },
  { key: 'wordpressDevelopment', value: 'WordPress Development' },
  { key: 'berduPlatform', value: 'Berdu Platform' },
  { key: 'mobileAppDevelopment', value: 'Mobile App Development' },
  { key: 'serviceHpLaptop', value: 'Service HP & Laptop' },
  { key: 'photoVideoEditing', value: 'Photo & Video Editing' },
] as const;

type ServiceKey = typeof layananOptions[number]['key'];

const layananKeyMap = {
  'Website Development': 'websiteDevelopment' as const,
  'WordPress Development': 'wordpressDevelopment' as const,
  'Berdu Platform': 'berduPlatform' as const,
  'Mobile App Development': 'mobileAppDevelopment' as const,
  'Service HP & Laptop': 'serviceHpLaptop' as const,
  'Photo & Video Editing': 'photoVideoEditing' as const,
} as const;

type LayananOption = typeof layananOptions[number]['value'];

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

type ServiceSpecificFields = {
  [K in ServiceKey]: {
    name: keyof ServiceDetails[K];
    type: 'text' | 'textarea';
    required: boolean;
  }[];
};

const serviceFieldConfigs: ServiceSpecificFields = {
  websiteDevelopment: [
    {
      name: 'namaBisnisBrand',
      type: 'text',
      required: true,
    },
    {
      name: 'jenisBisnis',
      type: 'textarea',
      required: true,
    },
    {
      name: 'tujuanWebsite',
      type: 'textarea',
      required: true,
    },
    {
      name: 'preferensiDesainWarna',
      type: 'textarea',
      required: false,
    },
    {
      name: 'domainDiinginkan',
      type: 'text',
      required: false,
    },
    {
      name: 'fiturKhusus',
      type: 'textarea',
      required: false,
    },
    {
      name: 'budgetEstimasiWaktu',
      type: 'textarea',
      required: true,
    },
    {
      name: 'kontakDapatDihubungi',
      type: 'text',
      required: true,
    },
    {
      name: 'catatanTambahan',
      type: 'textarea',
      required: false,
    },
  ],
  wordpressDevelopment: [
    {
      name: 'namaBrandSitus',
      type: 'text',
      required: true,
    },
    {
      name: 'jenisWebsite',
      type: 'textarea',
      required: true,
    },
    {
      name: 'pilihanTema',
      type: 'textarea',
      required: false,
    },
    {
      name: 'kebutuhanPlugin',
      type: 'textarea',
      required: false,
    },
    {
      name: 'kontenAwal',
      type: 'textarea',
      required: false,
    },
    {
      name: 'akunAdmin',
      type: 'textarea',
      required: true,
    },
    {
      name: 'budgetDeadline',
      type: 'textarea',
      required: true,
    },
    {
      name: 'catatanTambahan',
      type: 'textarea',
      required: false,
    },
  ],
  berduPlatform: [
    {
      name: 'namaBisnis',
      type: 'text',
      required: true,
    },
    {
      name: 'jenisUsaha',
      type: 'text',
      required: true,
    },
    {
      name: 'jumlahUserKelola',
      type: 'text',
      required: true,
    },
    {
      name: 'kebutuhanFiturDashboard',
      type: 'textarea',
      required: true,
    },
    {
      name: 'jenisDataAnalytics',
      type: 'textarea',
      required: true,
    },
    {
      name: 'preferensiIntegrasi',
      type: 'textarea',
      required: false,
    },
    {
      name: 'kontakPic',
      type: 'text',
      required: true,
    },
    {
      name: 'catatanTambahan',
      type: 'textarea',
      required: false,
    },
  ],
  mobileAppDevelopment: [
    {
      name: 'namaAplikasi',
      type: 'text',
      required: true,
    },
    {
      name: 'platformTarget',
      type: 'text',
      required: true,
    },
    {
      name: 'tujuanAplikasi',
      type: 'text',
      required: true,
    },
    {
      name: 'fiturUtama',
      type: 'textarea',
      required: true,
    },
    {
      name: 'mockupDesain',
      type: 'textarea',
      required: false,
    },
    {
      name: 'integrasiLayanan',
      type: 'textarea',
      required: false,
    },
    {
      name: 'estimasiJumlahPengguna',
      type: 'text',
      required: true,
    },
    {
      name: 'kontak',
      type: 'text',
      required: true,
    },
    {
      name: 'catatanTambahan',
      type: 'textarea',
      required: false,
    },
  ],
  serviceHpLaptop: [
    {
      name: 'jenisPerangkat',
      type: 'text',
      required: true,
    },
    {
      name: 'masalahUtama',
      type: 'textarea',
      required: true,
    },
    {
      name: 'informasiGaransi',
      type: 'textarea',
      required: false,
    },
    {
      name: 'pilihanLayanan',
      type: 'textarea',
      required: true,
    },
    {
      name: 'lokasiLayanan',
      type: 'text',
      required: true,
    },
    {
      name: 'kontak',
      type: 'text',
      required: true,
    },
    {
      name: 'catatanTambahan',
      type: 'textarea',
      required: false,
    },
  ],
  photoVideoEditing: [
    {
      name: 'namaProyek',
      type: 'text',
      required: true,
    },
    {
      name: 'jenisEditing',
      type: 'text',
      required: true,
    },
    {
      name: 'jumlahFile',
      type: 'text',
      required: true,
    },
    {
      name: 'kebutuhanSpesifik',
      type: 'textarea',
      required: true,
    },
    {
      name: 'resolusiFormatOutput',
      type: 'text',
      required: true,
    },
    {
      name: 'deadline',
      type: 'text',
      required: true,
    },
    {
      name: 'kontak',
      type: 'text',
      required: true,
    },
    {
      name: 'catatanTambahan',
      type: 'textarea',
      required: false,
    },
  ],
};

function toServiceKey(layanan: string): ServiceKey | undefined {
  return (layananKeyMap as Record<string, ServiceKey>)[layanan];
}

type OrderFormValues = {
  nama: string;
  email: string;
  whatsapp: string;
  layanan: LayananOption;
  layananDetails: ServiceDetails;
  preferensiKontak: 'whatsapp' | 'email' | 'meeting';
};

function getDefaultFormValues(): OrderFormValues {
  return {
    nama: '',
    email: '',
    whatsapp: '',
    layanan: undefined as unknown as LayananOption,
    layananDetails: {
      websiteDevelopment: {
        namaBisnisBrand: '',
        jenisBisnis: '',
        tujuanWebsite: '',
        preferensiDesainWarna: '',
        domainDiinginkan: '',
        fiturKhusus: '',
        budgetEstimasiWaktu: '',
        kontakDapatDihubungi: '',
        catatanTambahan: '',
      },
      wordpressDevelopment: {
        namaBrandSitus: '',
        jenisWebsite: '',
        pilihanTema: '',
        kebutuhanPlugin: '',
        kontenAwal: '',
        akunAdmin: '',
        budgetDeadline: '',
        catatanTambahan: '',
      },
      berduPlatform: {
        namaBisnis: '',
        jenisUsaha: '',
        jumlahUserKelola: '',
        kebutuhanFiturDashboard: '',
        jenisDataAnalytics: '',
        preferensiIntegrasi: '',
        kontakPic: '',
        catatanTambahan: '',
      },
      mobileAppDevelopment: {
        namaAplikasi: '',
        platformTarget: '',
        tujuanAplikasi: '',
        fiturUtama: '',
        mockupDesain: '',
        integrasiLayanan: '',
        estimasiJumlahPengguna: '',
        kontak: '',
        catatanTambahan: '',
      },
      serviceHpLaptop: {
        jenisPerangkat: '',
        masalahUtama: '',
        informasiGaransi: '',
        pilihanLayanan: '',
        lokasiLayanan: '',
        kontak: '',
        catatanTambahan: '',
      },
      photoVideoEditing: {
        namaProyek: '',
        jenisEditing: '',
        jumlahFile: '',
        kebutuhanSpesifik: '',
        resolusiFormatOutput: '',
        deadline: '',
        kontak: '',
        catatanTambahan: '',
      },
    },
    preferensiKontak: 'whatsapp',
  };
}

export default function Order() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ key: string; url: string; name: string }[]>([]);

  const form = useForm<OrderFormValues>({
    defaultValues: getDefaultFormValues(),
    mode: 'onSubmit',
    shouldUnregister: true,
  });

  const selectedLayanan = form.watch('layanan');
  const selectedServiceKey = selectedLayanan ? toServiceKey(selectedLayanan) : undefined;
  const serviceSpecificFields = selectedServiceKey ? serviceFieldConfigs[selectedServiceKey] : [];

  const getServiceLabel = (key: ServiceKey): string => {
    return t(`order.serviceOptions.${key}`) || key;
  };

  const getFieldLabel = (serviceKey: ServiceKey, fieldName: string): string => {
    return t(`order.services.${serviceKey}.${fieldName}.label`, { defaultValue: fieldName });
  };

  const getFieldPlaceholder = (serviceKey: ServiceKey, fieldName: string): string => {
    return t(`order.services.${serviceKey}.${fieldName}.placeholder`, { defaultValue: '' });
  };

  const onSubmit = async (values: OrderFormValues) => {
    const serviceKey = toServiceKey(values.layanan ?? '');
    if (!serviceKey) {
      toast({
        title: t('order.validation.serviceRequired', { defaultValue: 'Layanan belum dipilih' }),
        description: t('order.validation.selectServiceFirst', { defaultValue: 'Pilih salah satu layanan sebelum mengirim permintaan.' }),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine if this is service HP/Laptop (onsite service - no deposit)
      const isServiceOnly = serviceKey === 'serviceHpLaptop';

      // Default amount - admin will adjust later
      const defaultAmount = isServiceOnly ? 0 : 500000; // 500k IDR for paid services

      // Load Supabase API
      const api = await loadSupabaseApi();

      // Prepare order data matching the actual Supabase schema
      const orderData = {
        customer_name: values.nama,
        email: values.email,
        whatsapp: values.whatsapp,
        service_type: values.layanan, // Will be mapped to enum in API
        urgency: 'normal' as const,
        scope: {
          service_details: values.layananDetails[serviceKey],
          contact_preference: values.preferensiKontak,
          service_key: serviceKey,
          attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
        },
        delivery_method: 'pickup' as const,
        schedule_date: new Date().toISOString().split('T')[0],
        schedule_time: '10:00',
        shipping_cost: 0,
        subtotal: defaultAmount,
        discount: 0,
        fee: 0,
      };

      // Save to Supabase
      const result = await api.createOrUpdateOrder(orderData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order');
      }

      const createdOrder = result.data;
      const orderId = createdOrder?.id;

      // For service HP/Laptop, just show success message
      if (isServiceOnly) {
        toast({
          title: t('order.success.title', { defaultValue: '✅ Permintaan terkirim!' }),
          description: t('order.success.description', { defaultValue: 'Tim kami akan menghubungi Anda dalam 1x24 jam.' }),
        });
        form.reset(getDefaultFormValues());
        setUploadedFiles([]);
        navigate(`/order-success?orderId=${orderId}`);
      } else {
        // For other services, create payment transaction and redirect to payment page
        const depositAmount = createdOrder?.deposit || Math.round(defaultAmount * 0.5);
        
        const transactionResult = await api.createTransaction({
          order_id: orderId,
          amount: depositAmount,
          type: 'dp',
          method: 'bank_transfer',
          metadata: {
            service_type: values.layanan,
            customer_name: values.nama,
          },
        });

        if (!transactionResult.success) {
          console.warn('Transaction creation failed, but order was created:', transactionResult.error);
        }

        toast({
          title: t('order.success.title', { defaultValue: '✅ Permintaan terkirim!' }),
          description: 'Anda akan diarahkan ke halaman pembayaran...',
        });

        // Redirect to payment instructions page
        setTimeout(() => {
          navigate(`/payment-instructions?orderId=${orderId}&amount=${depositAmount}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: t('order.error.title', { defaultValue: 'Error' }),
        description: error instanceof Error ? error.message : t('order.error.description', { defaultValue: 'Terjadi kesalahan. Silakan coba lagi.' }),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Permintaan Penawaran - ekalliptus</title>
        <meta name="description" content="Formulir permintaan penawaran untuk semua layanan digital: website development, WordPress, mobile app, service laptop, dan editing foto/video. Gratis konsultasi!" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={getCanonicalUrl('/order')} />
        <meta property="og:title" content="Permintaan Penawaran - ekalliptus" />
        <meta property="og:description" content="Formulir permintaan penawaran untuk semua layanan digital. Tim ahli siap membantu transformasi digital bisnis Anda." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl('/order')} />
        <meta property="og:image" content={getOgUrl()} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Permintaan Penawaran - ekalliptus" />
        <meta name="twitter:description" content="Formulir permintaan penawaran untuk semua layanan digital. Tim ahli siap membantu." />
        <meta name="twitter:image" content={getOgUrl()} />
      </Helmet>

      <div className="relative flex flex-col gap-24 pb-24">
        <div className="content-vis relative px-4 py-24">
          <div className="absolute inset-0">
            <div className="pointer-events-none fx-bubble absolute left-[10%] top-[15%] h-40 w-40 rounded-full border border-border/20 bg-card/10 blur-3xl" />
            <div className="pointer-events-none fx-bubble absolute right-[15%] top-[25%] h-32 w-32 rounded-full border border-border/20 bg-emerald-400/10 blur-3xl" />
            <div className="pointer-events-none fx-bubble floating absolute bottom-[20%] left-[20%] h-36 w-36 rounded-full border border-border/20 bg-primary/10 blur-[70px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="mx-auto mb-16 max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-card/20 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.6em] text-muted-foreground mb-6">
                <span>{t('order.badge', { defaultValue: 'Request Quote' })}</span>
              </div>
              <h1 className="text-4xl font-semibold text-foreground md:text-5xl mb-8">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  <Trans
                    i18nKey="order.formTitle"
                    defaultValue="Permintaan <highlight>Penawaran</highlight>"
                    components={{ highlight: <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" /> }}
                  />
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('order.subtitle', {
                  defaultValue: 'Dapatkan penawaran terbaik untuk proyek digital Anda. Tim ahli siap membantu dari konsultasi hingga implementasi.'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="content-vis relative px-4">
          <div className="mx-auto max-w-5xl">
            <div className="glass-panel neon-border rounded-3xl p-8 md:p-12 shadow-elegant">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="glass-panel neon-border rounded-2xl p-6">
                    <h3 className="text-2xl font-semibold text-foreground mb-6">{t('order.basicInfo.title', { defaultValue: 'Informasi Dasar' })}</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="nama"
                          rules={{ required: t('order.validation.nameRequired', { defaultValue: 'Nama wajib diisi' }) }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">{t('order.fields.name.label', { defaultValue: 'Nama Lengkap' })} <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input {...field} placeholder={t('order.fields.name.placeholder', { defaultValue: 'Masukkan nama lengkap' })} className="bg-card/50 border-border" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          rules={{
                            required: t('order.validation.emailRequired', { defaultValue: 'Email wajib diisi' }),
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: t('order.validation.emailInvalid', { defaultValue: 'Format email tidak valid' }),
                            },
                          }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">{t('order.fields.email.label', { defaultValue: 'Email' })} <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder={t('order.fields.email.placeholder', { defaultValue: 'email@example.com' })} className="bg-card/50 border-border" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="whatsapp"
                          rules={{
                            required: t('order.validation.whatsappRequired', { defaultValue: 'WhatsApp wajib diisi' }),
                            pattern: {
                              value: /^[0-9+\-\s()]+$/,
                              message: t('order.validation.whatsappInvalid', { defaultValue: 'Format nomor tidak valid' }),
                            },
                          }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">{t('order.fields.whatsapp.label', { defaultValue: 'WhatsApp' })} <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input {...field} placeholder={t('order.fields.whatsapp.placeholder', { defaultValue: '08123456789' })} className="bg-card/50 border-border" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="layanan"
                          rules={{ required: t('order.validation.serviceRequired', { defaultValue: 'Pilih layanan yang diinginkan' }) }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">{t('order.fields.service.label', { defaultValue: 'Layanan yang Diinginkan' })} <span className="text-destructive">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-card/50 border-border">
                                    <SelectValue placeholder={t('order.fields.service.placeholder', { defaultValue: 'Pilih layanan' })} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {layananOptions.map((option) => (
                                    <SelectItem key={option.key} value={option.value}>
                                      {t(`order.serviceOptions.${option.key}`)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {selectedServiceKey && (
                    <div className="glass-panel neon-border rounded-2xl p-6">
                      <h3 className="text-2xl font-semibold text-foreground mb-6">
                        {t('order.projectDetails.title', { defaultValue: 'Detail Proyek' })} {getServiceLabel(selectedServiceKey)}
                      </h3>
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                        <p className="text-sm text-muted-foreground">
                          {t('order.projectDetails.description', { defaultValue: 'Jelaskan detail proyek Anda sebisa mungkin agar tim kami dapat memberikan penawaran yang akurat.' })}
                        </p>
                      </div>
                      <div className="space-y-6">
                        {serviceSpecificFields.map((fieldConfig: (typeof serviceFieldConfigs)[ServiceKey][number]) => {
                          const fieldNameStr = String(fieldConfig.name);
                          const fieldPath = `layananDetails.${selectedServiceKey}.${fieldNameStr}` as const;
                          const fieldLabel = getFieldLabel(selectedServiceKey, fieldNameStr);
                          const fieldPlaceholder = getFieldPlaceholder(selectedServiceKey, fieldNameStr);
                          return (
                            <FormField
                              key={fieldNameStr}
                              control={form.control}
                              name={fieldPath as any}
                              rules={{
                                required: fieldConfig.required ? t('order.validation.fieldRequired', { field: fieldLabel, defaultValue: `${fieldLabel} wajib diisi` }) : false,
                              }}
                              render={({ field }) => {
                                const serviceDetailsValue = form.getValues(fieldPath as any);
                                const fieldValue = serviceDetailsValue || '';
                                return (
                                  <FormItem>
                                    <FormLabel className="text-foreground">
                                      {fieldLabel}
                                      {fieldConfig.required && <span className="text-destructive ml-1">*</span>}
                                    </FormLabel>
                                    <FormControl>
                                      {fieldConfig.type === 'textarea' ? (
                                        <Textarea
                                          {...field}
                                          value={fieldValue}
                                          onChange={(e) => {
                                            const newDetails = { ...form.getValues('layananDetails') };
                                            (newDetails as any)[selectedServiceKey] = {
                                              ...(newDetails as any)[selectedServiceKey],
                                              [fieldNameStr]: e.target.value
                                            };
                                            form.setValue('layananDetails', newDetails);
                                          }}
                                          placeholder={fieldPlaceholder}
                                          rows={3}
                                          className="bg-card/50 border-border"
                                        />
                                      ) : (
                                        <Input
                                          {...field}
                                          value={fieldValue}
                                          onChange={(e) => {
                                            const newDetails = { ...form.getValues('layananDetails') };
                                            (newDetails as any)[selectedServiceKey] = {
                                              ...(newDetails as any)[selectedServiceKey],
                                              [fieldNameStr]: e.target.value
                                            };
                                            form.setValue('layananDetails', newDetails);
                                          }}
                                          placeholder={fieldPlaceholder}
                                          className="bg-card/50 border-border"
                                        />
                                      )}
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="glass-panel neon-border rounded-2xl p-6">
                    <h3 className="text-2xl font-semibold text-foreground mb-6">{t('order.fields.contactPreference.label', { defaultValue: 'Preferensi Kontak' })}</h3>
                    <FormField
                      control={form.control}
                      name="preferensiKontak"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-3"
                            >
                              <div className="flex items-start space-x-3">
                                <RadioGroupItem value="whatsapp" id="whatsapp" className="mt-1" />
                                <div className="grid gap-1.5 leading-none">
                                  <Label htmlFor="whatsapp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground">
                                    {t('order.contactPreferences.whatsapp.label', { defaultValue: 'WhatsApp' })}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">{t('order.contactPreferences.whatsapp.helper', { defaultValue: 'Disarankan untuk komunikasi cepat' })}</p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-3">
                                <RadioGroupItem value="email" id="email" className="mt-1" />
                                <div className="grid gap-1.5 leading-none">
                                  <Label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground">
                                    {t('order.contactPreferences.email.label', { defaultValue: 'Email' })}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">{t('order.contactPreferences.email.helper', { defaultValue: 'Untuk diskusi detail yang lebih panjang' })}</p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-3">
                                <RadioGroupItem value="meeting" id="meeting" className="mt-1" />
                                <div className="grid gap-1.5 leading-none">
                                  <Label htmlFor="meeting" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground">
                                    {t('order.contactPreferences.meeting.label', { defaultValue: 'Meeting Online' })}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">{t('order.contactPreferences.meeting.helper', { defaultValue: 'Untuk konsultansi mendalam' })}</p>
                                </div>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* File Upload Section */}
                  <div className="glass-panel neon-border rounded-2xl p-6">
                    <h3 className="text-2xl font-semibold text-foreground mb-6">
                      {t('order.attachments.title', { defaultValue: 'Lampiran (Opsional)' })}
                    </h3>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                      <p className="text-sm text-muted-foreground">
                        {t('order.attachments.description', {
                          defaultValue: 'Unggah file referensi seperti logo, brand guideline, contoh desain, atau dokumen brief proyek. Maksimal 5 file, 20MB per file.'
                        })}
                      </p>
                    </div>
                    <FileUpload
                      maxFiles={5}
                      maxSize={20 * 1024 * 1024}
                      onFilesUploaded={(files) => setUploadedFiles(files)}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary hover:to-secondary text-white font-semibold shadow-lg hover:shadow-xl px-12 py-6 text-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('order.actions.submitting', { defaultValue: 'Mengirim...' })}
                        </>
                      ) : (
                        t('order.actions.submit', { defaultValue: 'Kirim Permintaan' })
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
