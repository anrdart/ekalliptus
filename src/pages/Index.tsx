import { Hero } from "@/components/Hero";
import { lazy, Suspense } from "react";

const ServicesLazy = lazy(() => import("@/components/Services").then((m) => ({ default: m.Services })));
const ContactCTALazy = lazy(() => import("@/components/ContactCTA").then((m) => ({ default: m.ContactCTA })));

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Suspense fallback={<div className="content-vis py-20" />}>
        <ServicesLazy />
      </Suspense>
      <Suspense fallback={<div className="content-vis py-20" />}>
        <ContactCTALazy />
      </Suspense>
    </div>
  );
};

export default Index;
