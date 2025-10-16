# 🌟 Ekalliptus Digital Agency

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Deskripsi Proyek

**Ekalliptus Digital Agency** adalah situs web modern dan responsif untuk agensi digital terdepan di Indonesia. Kami menyediakan solusi digital komprehensif termasuk pengembangan website, kustomisasi WordPress, pengembangan aplikasi mobile, dan layanan editing foto/video profesional. Situs ini dibangun dengan teknologi terkini untuk memberikan pengalaman pengguna yang luar biasa dan performa optimal.

## ✨ Fitur Utama

### 🚀 **Teknologi Modern**
- **React 18** dengan TypeScript untuk type safety
- **Vite** sebagai build tool ultra-cepat
- **Tailwind CSS** untuk styling yang konsisten dan responsif
- **React Router** untuk navigasi SPA yang mulus

### 🎨 **UI/UX Canggih**
- **Shadcn/ui** components dengan Radix UI primitives
- **Custom animations** dan efek visual yang menarik
- **Dark/Light mode** support dengan next-themes
- **Responsive design** untuk semua perangkat

### 🌐 **Internasionalisasi**
- **Multi-language support** (Indonesia, English, Arabic, Japanese, Korean, Russian, Turkish)
- **i18next** untuk manajemen terjemahan yang efisien
- **RTL support** untuk bahasa Arab

### 🔍 **SEO & Performance**
- **React Helmet Async** untuk meta tags dinamis
- **Lazy loading** untuk komponen dan gambar
- **Optimized images** dengan WebP format
- **Structured data** (JSON-LD) untuk rich snippets

### 📱 **Fitur Interaktif**
- **Custom cursor** dengan efek hover
- **Smooth scrolling** navigation
- **Contact forms** dengan validasi
- **FAQ accordion** dengan animasi

## 🛠️ Teknologi & Dependensi

### **Core Dependencies**
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "typescript": "^5.8.3",
  "tailwindcss": "^3.4.17",
  "vite": "^5.4.19"
}
```

### **UI & Styling**
- `@radix-ui/*` - Component primitives
- `lucide-react` - Icon library
- `class-variance-authority` - Component variants
- `tailwind-merge` - Utility merging

### **State & Data**
- `@tanstack/react-query` - Data fetching
- `react-hook-form` - Form management
- `zod` - Schema validation

### **Internationalization**
- `i18next` - i18n framework
- `react-i18next` - React integration

### **Development Tools**
- `eslint` - Code linting
- `@vitejs/plugin-react-swc` - Fast refresh
- `autoprefixer` - CSS prefixing

## 🚀 Instalasi & Setup

### **Persyaratan Sistem**
- Node.js 18+ dan npm/yarn
- Git untuk version control

### **Langkah Instalasi**

1. **Clone repository**
   ```bash
   git clone https://github.com/your-username/ekalliptus-digital-agency.git
   cd ekalliptus-digital-agency
   ```

2. **Install dependencies**
   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env dengan konfigurasi Anda
   ```

4. **Start development server**
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

5. **Build untuk production**
   ```bash
   npm run build
   # atau
   yarn build
   ```

6. **Preview production build**
   ```bash
   npm run preview
   # atau
   yarn preview
   ```

## 📖 Contoh Penggunaan

### **Navigasi Antar Halaman**
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Index } from './pages/Index';
import { Order } from './pages/Order';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/order" element={<Order />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### **Penggunaan i18n**
```tsx
import { useTranslation } from 'react-i18next';

function Hero() {
  const { t } = useTranslation();

  return (
    <h1>{t('hero.title', { defaultValue: 'Welcome to Ekalliptus' })}</h1>
  );
}
```

### **Custom Hook untuk Lazy Loading**
```tsx
import { useLazyLoad } from '@/hooks/use-lazy-load';

function ServiceCard({ imageSrc, title }) {
  const { ref, isVisible } = useLazyLoad();

  return (
    <div ref={ref} className={`transition-opacity ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <img src={imageSrc} alt={title} loading="lazy" />
    </div>
  );
}
```

### **Form dengan Validasi**
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
});

function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Kirim</button>
    </form>
  );
}
```

## 🤝 Panduan Kontribusi

Kami sangat menghargai kontribusi dari komunitas! Berikut adalah panduan untuk berkontribusi:

### **Langkah Kontribusi**

1. **Fork** repository ini
2. **Buat branch** untuk fitur baru: `git checkout -b feature/nama-fitur`
3. **Commit** perubahan Anda: `git commit -m 'Add some feature'`
4. **Push** ke branch: `git push origin feature/nama-fitur`
5. **Buat Pull Request**

### **Standar Kode**
- Gunakan **TypeScript** untuk type safety
- Ikuti **ESLint** configuration
- Gunakan **conventional commits**
- Pastikan **tests pass** sebelum submit PR

### **Struktur Proyek**
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── config/        # Configuration files
├── i18n/          # Internationalization
└── assets/        # Static assets
```

## 📄 Lisensi

Proyek ini menggunakan lisensi **MIT**. Lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.

```
MIT License

Copyright (c) 2024 Ekalliptus Digital Agency

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 📞 Kontak & Dukungan

### **Informasi Kontak**
- **Email**: ekalliptus@gmail.com
- **Telepon**: +62 819-9990-0306
- **Website**: [https://ekalliptus.id](https://ekalliptus.id)
- **Alamat**: Tegal, Indonesia

### **Media Sosial**
- **Twitter**: [@ekalliptus](https://twitter.com/ekalliptus)
- **LinkedIn**: [Ekalliptus Digital Agency](https://linkedin.com/company/ekalliptus)

### **Dukungan**
- 📧 **Email Support**: ekalliptus@gmail.com
- 💬 **Live Chat**: Tersedia di website
- 📱 **WhatsApp**: +62 819-9990-0306
- 🕒 **Jam Operasional**: 24/7

### **Layanan Kami**
- 🌐 **Website Development** - Pembuatan website responsif dan modern
- 📱 **Mobile App Development** - Aplikasi Android & iOS
- 🎨 **WordPress Customization** - Tema dan plugin custom
- ✏️ **Photo/Video Editing** - Editing profesional berkualitas tinggi
- 🔧 **PC & Laptop Service** - Perbaikan dan maintenance

---

**Ekalliptus Digital Agency** - Transformasi Digital Terdepan untuk Bisnis Modern di Indonesia 🚀