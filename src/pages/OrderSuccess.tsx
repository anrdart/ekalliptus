'use client';

import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const OrderSuccess = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <>
      <Helmet>
        <title>{t('order.successPage.metaTitle', { defaultValue: 'Permintaan Diterima - ekalliptus' })}</title>
        <meta
          name="description"
          content={t('order.successPage.metaDescription', {
            defaultValue: 'Terima kasih! Tim ekalliptus sudah menerima permintaan servis perangkat Anda.',
          })}
        />
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="content-vis relative flex min-h-[70vh] items-center justify-center px-4 py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating absolute inset-x-0 top-10 mx-auto h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-10 h-40 w-40 rounded-full border border-primary/10 bg-secondary/10 blur-[90px]" />
        </div>

        <div className="glass-panel neon-border relative z-10 max-w-2xl rounded-3xl p-10 text-center shadow-elegant">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary">
            <CheckCircle2 className="h-10 w-10" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
            {t('order.successPage.title', { defaultValue: 'Permintaan servis berhasil dikirim' })}
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            {t('order.successPage.description', {
              defaultValue:
                'Tim kami akan menghubungi Anda dalam 1x24 jam melalui kontak yang sudah dicantumkan. Mohon siapkan perangkat dan detail tambahan agar proses pengecekan lebih cepat.',
            })}
          </p>

          {orderId && (
            <div className="mt-6 rounded-2xl border border-border/50 bg-card/50 px-5 py-4 text-sm text-foreground/80">
              <span className="font-semibold">{t('order.successPage.orderId', { defaultValue: 'ID Permintaan' })}</span>
              <span className="ml-2 font-mono text-muted-foreground">{orderId}</span>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="rounded-2xl px-6 py-5 text-base font-semibold">
              <Link to="/">
                {t('order.successPage.backHome', { defaultValue: 'Kembali ke beranda' })}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-2xl border-primary/30 text-primary hover:bg-primary/10"
            >
              <Link to="/order" className="flex items-center gap-2">
                {t('order.successPage.newRequest', { defaultValue: 'Kirim permintaan lain' })}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default OrderSuccess;
