import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { BackgroundFX } from "@/components/BackgroundFX";
import { CustomCursor } from "@/components/CustomCursor";
import { Navigation } from "@/components/Navigation";
import { AuthProvider } from "@/contexts/AuthContext";
const Order = lazy(() => import("./pages/Order"));
const BankTransfer = lazy(() => import("./pages/BankTransfer"));
const PaymentInstructions = lazy(() => import("./pages/PaymentInstructions"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Error = lazy(() => import("./pages/Error"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BackgroundFX />
        <CustomCursor />
        <AuthProvider>
          <BrowserRouter>
            <Navigation />
            <main className="relative z-0 flex min-h-screen flex-col pt-16 md:pt-20">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/order"
                element={
                  <Suspense fallback={<div className="p-10 text-center text-foreground/80">Memuat...</div>}>
                    <Order />
                  </Suspense>
                }
              />
              <Route
                path="/bank-transfer"
                element={
                  <Suspense fallback={<div className="p-10 text-center text-foreground/80">Memuat...</div>}>
                    <BankTransfer />
                  </Suspense>
                }
              />
              <Route
                path="/payment-instructions"
                element={
                  <Suspense fallback={<div className="p-10 text-center text-foreground/80">Memuat...</div>}>
                    <PaymentInstructions />
                  </Suspense>
                }
              />
              <Route
                path="/order-success"
                element={
                  <Suspense fallback={<div className="p-10 text-center text-foreground/80">Memuat...</div>}>
                    <OrderSuccess />
                  </Suspense>
                }
              />
              <Route
                path="/privacy-policy"
                element={
                  <Suspense fallback={<div className="p-10 text-center text-foreground/80">Memuat...</div>}>
                    <PrivacyPolicy />
                  </Suspense>
                }
              />
              <Route
                path="/terms-of-service"
                element={
                  <Suspense fallback={<div className="p-10 text-center text-foreground/80">Memuat...</div>}>
                    <TermsOfService />
                  </Suspense>
                }
              />
              <Route
                path="/error"
                element={
                  <Suspense fallback={<div className="p-10 text-center text-foreground/80">Memuat...</div>}>
                    <Error />
                  </Suspense>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </BrowserRouter>
      </AuthProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
