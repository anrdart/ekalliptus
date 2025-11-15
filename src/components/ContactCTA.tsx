import { Card } from "@/components/ui/card";
import { MessageCircle, Mail, Phone } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";


export const ContactCTA = () => {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  const { t } = useTranslation();
  const base =
    "transition-all duration-700 ease-smooth will-change-transform motion-reduce:transition-none motion-reduce:transform-none";
  const show = inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6";
  const whatsappNumber = "6281999900306";
  const whatsappMessage = t("contactCTA.whatsappMessage");
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(whatsappMessage)}`;
  const emailSubject = encodeURIComponent(t("contactCTA.emailSubject"));
  const emailBody = encodeURIComponent(t("contactCTA.emailBody"));


  return (
    <section id="contact" className="content-vis relative px-4 py-24">

      <div className="relative z-10 mx-auto max-w-4xl">
        <Card
          className={`glass-panel neon-border rounded-[2.5rem] p-12 shadow-elegant ${base} ${show}`}
          style={{ transitionDelay: "100ms" }}
        >
          <div ref={ref} className="text-center">
            <h2
              className={`bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-3xl font-semibold uppercase tracking-[0.4em] text-transparent md:text-4xl ${base} ${show}`}
              style={{ transitionDelay: "200ms" }}
            >
              {t("contactCTA.title")}
            </h2>
            <p
              className={`mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg ${base} ${show}`}
              style={{ transitionDelay: "300ms" }}
            >
              {t("contactCTA.description")}
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
                {t("contactCTA.buttons.whatsapp")}
              </a>

              <a
                href={`mailto:ekalliptus@gmail.com?subject=${emailSubject}&body=${emailBody}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "group pointer-events-auto rounded-full px-8 py-5 text-base font-semibold uppercase tracking-wide cursor-interactive relative z-20",
                )}
              >
                <Mail className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                {t("contactCTA.buttons.email")}
              </a>
            </div>


            <div
              className={`mt-10 flex flex-col items-center justify-center gap-6 text-sm text-muted-foreground sm:flex-row ${base} ${show}`}
              style={{ transitionDelay: "500ms" }}
            >
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{t("contactCTA.contact.phone")}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>{t("contactCTA.contact.email")}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
