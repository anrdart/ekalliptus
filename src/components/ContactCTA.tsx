import { Card } from "@/components/ui/card";
import { MessageCircle, Mail, Phone } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";


export const ContactCTA = () => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  const base =
    "transition-all duration-700 ease-smooth will-change-transform motion-reduce:transition-none motion-reduce:transform-none";
  const show = inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6";
  const whatsappNumber = "6281999900306";
  const whatsappMessage =
    "Halo ekalliptus, saya ingin berkonsultasi mengenai layanan yang tersedia. Mohon bantuannya ya.";
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(whatsappMessage)}`;
  const emailSubject = encodeURIComponent("Konsultasi Gratis - ekalliptus");
  const emailBody = encodeURIComponent(
    "Halo ekalliptus,\n\nSaya ingin berkonsultasi mengenai layanan yang tersedia. Mohon bantuannya ya.\n\nTerima kasih.",
  );


  return (
    <section id="contact" className="content-vis relative px-4 py-24">

      <div className="relative z-10 mx-auto max-w-4xl">
        <Card
          className={`glass-panel neon-border rounded-[2.5rem] p-12 shadow-elegant ${base} ${show}`}
          style={{ transitionDelay: "100ms" }}
        >
          <div ref={ref} className="text-center">
            <h2
              className={`bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-300 bg-clip-text text-3xl font-semibold uppercase tracking-[0.4em] text-transparent md:text-4xl ${base} ${show}`}
              style={{ transitionDelay: "200ms" }}
            >
              Siap memulai proyek Anda?
            </h2>
            <p
              className={`mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg ${base} ${show}`}
              style={{ transitionDelay: "300ms" }}
            >
              Ajak kami berdiskusi dan temukan bagaimana sentuhan desain immersive dapat meningkatkan persepsi brand serta mendekatkan pengguna dengan produk Anda.
            </p>


            <div
              className={`mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row ${base} ${show}`}
              style={{ transitionDelay: "400ms" }}
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "hero", size: "lg" }),
                  "group pointer-events-auto rounded-full px-8 py-5 text-base font-semibold uppercase tracking-wide cursor-interactive relative z-20",
                )}
              >
                <MessageCircle className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                Konsultasi Gratis
              </a>

              <a
                href={`mailto:ekalliptus@gmail.com?subject=${emailSubject}&body=${emailBody}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "group pointer-events-auto rounded-full border-white/15 bg-white/5 px-8 py-5 text-base font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10 cursor-interactive relative z-20",
                )}
              >
                <Mail className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                Kirim Email
              </a>
            </div>


            <div
              className={`mt-10 flex flex-col items-center justify-center gap-6 text-sm text-white/60 sm:flex-row ${base} ${show}`}
              style={{ transitionDelay: "500ms" }}
            >
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+62 819-9990-0306</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>ekalliptus@gmail.com</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
