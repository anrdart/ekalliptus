import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Hero } from "@/components/Hero";

const ServicesLazy = lazy(() => import("@/components/Services").then((m) => ({ default: m.Services })));
const ContactCTALazy = lazy(() => import("@/components/ContactCTA").then((m) => ({ default: m.ContactCTA })));

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const target = document.getElementById(id);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  }, [location.hash]);

  return (
    <div className="relative flex flex-col gap-24 pb-24">
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
