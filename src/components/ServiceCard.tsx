import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getServicePaymentConfig, ServiceKey } from "@/config/servicePayment.config";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  serviceKey?: ServiceKey;
}

export const ServiceCard = ({ icon: Icon, title, description, features, serviceKey }: ServiceCardProps) => {
  const { t, i18n } = useTranslation();

  // Get payment configuration for this service
  const paymentConfig = serviceKey ? getServicePaymentConfig(serviceKey) : null;

  // Generate payment text based on service config - reactive to language changes
  const paymentText = useMemo(() => {
    if (!paymentConfig) return t('services.expertise');

    if (!paymentConfig.paymentRequired || paymentConfig.paymentType === 'cash') {
      return t('payment.cash');
    }

    if (paymentConfig.paymentType === 'deposit') {
      return t('payment.deposit', { percentage: paymentConfig.depositPercentage || 50 });
    }

    return t('payment.full');
  }, [t, i18n.language, paymentConfig]);



  return (
    <Card className="group relative overflow-hidden p-8 text-left transition duration-500 hover:-translate-y-1.5">
      <meta itemProp="name" content={title} />
      <meta itemProp="description" content={description} />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="fx-bubble absolute inset-0 bg-gradient-to-br from-sky-500/20 via-transparent to-emerald-400/20 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-6">
        <div className="inline-flex w-max items-center gap-3 rounded-full border border-border/50 bg-card/30 px-5 py-3 transition duration-500 group-hover:border-border/60 group-hover:bg-card/40">
          <div className="rounded-full bg-primary-gradient p-3 text-primary-foreground shadow-glow transition duration-500 group-hover:scale-110" aria-hidden="true">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{paymentText}</span>
        </div>

        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-semibold text-foreground transition-colors duration-500 group-hover:text-primary" itemProp="name">
            {title}
          </h3>
        </div>

        <p className="text-base leading-relaxed text-muted-foreground transition-colors duration-500 group-hover:text-foreground" itemProp="description">
          {description}
        </p>

        <ul className="mt-2 flex flex-col gap-3 text-sm text-muted-foreground" itemProp="hasOfferCatalog" itemScope itemType="https://schema.org/OfferCatalog">
          {features.map((feature, index) => (
            <li
              key={index}
              className="flex items-center gap-3 rounded-full bg-card/25 px-4 py-2 transition group-hover:bg-card/40 group-hover:text-foreground"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-sky-400 to-emerald-300 transition group-hover:scale-125" aria-hidden="true" />
              <span itemProp="name">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};
