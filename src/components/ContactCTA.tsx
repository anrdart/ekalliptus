import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Mail, Phone } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

export const ContactCTA = () => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  const base =
    "transition-all duration-700 ease-smooth will-change-transform motion-reduce:transition-none motion-reduce:transform-none";
  const show = inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6";

  return (
    <section className="py-20 px-4 bg-secondary/30 content-vis">
      <div className="max-w-4xl mx-auto">
        <Card
          className={`p-12 bg-card-gradient border-border/50 shadow-elegant ${base} ${show}`}
          style={{ transitionDelay: "100ms" }}
        >
          <div ref={ref} className="text-center">
            <h2
              className={`text-3xl md:text-4xl font-bold text-foreground mb-6 ${base} ${show}`}
              style={{ transitionDelay: "200ms" }}
            >
              Siap Memulai Proyek Anda?
            </h2>
            <p
              className={`text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed ${base} ${show}`}
              style={{ transitionDelay: "300ms" }}
            >
              Hubungi kami sekarang untuk konsultasi gratis dan wujudkan ide digital Anda
              bersama tim profesional ekalliptus
            </p>

            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 ${base} ${show}`}
              style={{ transitionDelay: "400ms" }}
            >
              <Button variant="hero" size="lg" className="text-lg px-8 py-4" asChild>
                <a
                  href="https://api.whatsapp.com/send?phone=6281999900306&text=Halo%20ekalliptus%2C%20saya%20ingin%20konsultasi"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Konsultasi Gratis
                </a>
              </Button>

              <Button variant="accent" size="lg" className="text-lg px-8 py-4" asChild>
                <a
                  href="mailto:ekalliptus@gmail.com?subject=Konsultasi%20Gratis%20-%20ekalliptus&body=Halo%20ekalliptus%2C%20saya%20ingin%20konsultasi%20tentang%20layanan%20Anda."
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Kirim Email
                </a>
              </Button>
            </div>

            <div
              className={`flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-muted-foreground ${base} ${show}`}
              style={{ transitionDelay: "500ms" }}
            >
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+62 819-9990-0306</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>ekalliptus@gmail.com</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};