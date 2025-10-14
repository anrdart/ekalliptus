import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useInView } from "@/hooks/use-in-view";

const faqs = [
  {
    question: "Berapa lama waktu pengerjaan untuk website development?",
    answer:
      "Waktu pengerjaan website development bervariasi tergantung kompleksitas proyek. Website company profile sederhana biasanya memakan waktu 2-3 minggu, sedangkan e-commerce atau aplikasi web kompleks dapat memakan waktu 1-3 bulan. Kami akan memberikan timeline yang jelas setelah analisis kebutuhan awal.",
  },
  {
    question: "Apakah ekalliptus menyediakan layanan maintenance website setelah launching?",
    answer:
      "Ya, kami menyediakan paket maintenance website yang mencakup update rutin, backup data, monitoring keamanan, dan technical support. Paket maintenance dapat disesuaikan dengan kebutuhan bisnis Anda, mulai dari maintenance bulanan hingga tahunan.",
  },
  {
    question: "Apakah WordPress development cocok untuk bisnis skala besar?",
    answer:
      "Absolut! WordPress development yang kami kerjakan dapat di-scale untuk bisnis enterprise dengan custom plugin, optimasi performa tinggi, dan integrasi sistem yang kompleks. Banyak brand besar menggunakan WordPress sebagai CMS mereka berkat fleksibilitas dan ekosistem plugin yang kuat.",
  },
  {
    question: "Bagaimana proses order layanan di ekalliptus?",
    answer:
      "Proses sangat mudah: (1) Isi form order di website kami dengan detail kebutuhan, (2) Tim kami akan menghubungi Anda dalam 24 jam untuk diskusi lebih lanjut, (3) Kami kirimkan proposal dan quotation, (4) Setelah deal, mulai tahap development dengan milestone yang jelas, (5) Testing dan revisi, (6) Launching dan handover proyek.",
  },
  {
    question: "Apakah saya bisa request fitur custom untuk mobile app development?",
    answer:
      "Tentu saja! Mobile app development kami sepenuhnya customizable sesuai kebutuhan bisnis Anda. Kami menggunakan teknologi React Native dan Flutter untuk membangun aplikasi cross-platform dengan fitur native yang powerful. Diskusikan kebutuhan fitur Anda dengan tim kami untuk mendapatkan solusi terbaik.",
  },
  {
    question: "Apa yang membedakan layanan ekalliptus dengan digital agency lainnya?",
    answer:
      "ekalliptus menggabungkan teknologi terkini dengan desain yang user-centric. Kami tidak hanya fokus pada kode yang clean, tetapi juga user experience yang memorable dengan elemen 3D, glassmorphism, dan micro-interactions. Setiap proyek diperlakukan secara personal dengan tim dedicated yang siap support hingga proyek sukses.",
  },
  {
    question: "Apakah layanan service HP & laptop tersedia untuk semua merk?",
    answer:
      "Ya, kami melayani service untuk berbagai merk HP dan laptop termasuk Apple, Samsung, Xiaomi, ASUS, Lenovo, HP, Dell, dan lainnya. Tim teknisi kami berpengalaman menangani berbagai masalah hardware dan software dengan sparepart original dan garansi resmi.",
  },
  {
    question: "Berapa biaya untuk photo & video editing profesional?",
    answer:
      "Biaya editing foto dan video bervariasi tergantung jumlah file, durasi, dan kompleksitas editing yang dibutuhkan. Untuk editing foto berkisar mulai dari Rp 50.000/foto, sedangkan video mulai dari Rp 500.000 untuk durasi pendek dengan editing standar. Hubungi kami untuk quotation detail berdasarkan kebutuhan proyek Anda.",
  },
];

export const FAQ = () => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  const base = "transition-all duration-700 ease-smooth";
  const show = inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <section id="faq" className="relative content-vis px-4 py-24">
        <div ref={ref} className="relative z-10 mx-auto max-w-4xl">
          <div className={`mb-12 text-center ${base} ${show}`}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/25 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.6em] text-muted-foreground">
              FAQ
            </div>
            <h2 className="mt-6 text-4xl font-semibold text-foreground md:text-5xl">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              Temukan jawaban untuk pertanyaan umum seputar layanan website development Indonesia, WordPress custom, mobile app development, dan layanan digital lainnya dari ekalliptus.
            </p>
          </div>

          <div className={`${base} ${show}`} style={{ transitionDelay: "200ms" }}>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="glass-panel neon-border rounded-2xl px-6 py-2"
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:no-underline">
                    <span itemProp="name">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent
                    className="text-base leading-relaxed text-muted-foreground"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <div itemProp="text">{faq.answer}</div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  );
};
