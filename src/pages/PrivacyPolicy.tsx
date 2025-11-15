import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { SEO_CONFIG, getCanonicalUrl } from "@/config/seo.config";

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // For title and lastUpdated, use current language if available, otherwise use English
  const titleKey = 'privacyPolicy.title';
  const lastUpdatedKey = 'privacyPolicy.lastUpdated';

  // Check if current language has the title, otherwise use English
  const title = t(titleKey) === titleKey ? t(titleKey, { lng: 'en' }) : t(titleKey);
  const lastUpdated = t(lastUpdatedKey, { date: currentDate }) === lastUpdatedKey
    ? t(lastUpdatedKey, { date: currentDate, lng: 'en' })
    : t(lastUpdatedKey, { date: currentDate });

  // All content sections use English (force to English for non-ID/EN languages)
  const currentLang = t('privacyPolicy.title') !== titleKey ? 'en' : 'id';

  return (
    <>
      <Helmet>
        <title>{title} - ekalliptus</title>
        <meta name="description" content={`Privacy Policy for ekalliptus digital agency services. Learn about our data collection practices, user rights, and compliance with GDPR and CCPA.`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={getCanonicalUrl("/privacy-policy")} />
        <meta property="og:title" content={`${title} - ekalliptus`} />
        <meta property="og:description" content="Privacy Policy for ekalliptus digital agency services" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getCanonicalUrl("/privacy-policy")} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${title} - ekalliptus`} />
        <meta name="twitter:description" content="Privacy Policy for ekalliptus digital agency services" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {lastUpdated}
              </p>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
              {[
                'privacyPolicy.sections.introduction',
                'privacyPolicy.sections.informationWeCollect',
                'privacyPolicy.sections.howWeUseInformation',
                'privacyPolicy.sections.legalBasis',
                'privacyPolicy.sections.cookies',
                'privacyPolicy.sections.dataSharing',
                'privacyPolicy.sections.dataSecurity',
                'privacyPolicy.sections.yourRights',
                'privacyPolicy.sections.dataRetention',
                'privacyPolicy.sections.internationalTransfers',
                'privacyPolicy.sections.childrensPrivacy',
                'privacyPolicy.sections.changes',
                'privacyPolicy.sections.contact'
              ].map((sectionKey) => (
                <Section key={sectionKey} sectionKey={sectionKey} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Section = ({ sectionKey }: { sectionKey: string }) => {
  const { t } = useTranslation();
  const sectionData = t(sectionKey, { lng: 'en' });

  if (typeof sectionData === 'string' || sectionKey === 'privacyPolicy.sections.cookies' || sectionKey === 'privacyPolicy.sections.yourRights' || sectionKey === 'privacyPolicy.sections.intellectualProperty' || sectionKey === 'privacyPolicy.sections.paymentTerms' || sectionKey === 'privacyPolicy.sections.disputeResolution') {
    // Handle section with subsections
    const title = t(`${sectionKey}.title`, { lng: 'en' });
    const content = t(`${sectionKey}.content`, { lng: 'en' });
    const content2 = t(`${sectionKey}.content2`, { lng: 'en' });
    const items = t(`${sectionKey}.items`, { lng: 'en' }) as unknown as string[];

    return (
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h2>
        {content && (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {content}
          </p>
        )}
        {content2 && (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
            {content2}
          </p>
        )}
        {items && Array.isArray(items) && (
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
            {items.map((item: string, index: number) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }}></li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  // Handle simple section
  const title = sectionData?.title;
  const content = sectionData?.content;

  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {content}
      </p>
    </section>
  );
};

export default PrivacyPolicy;
