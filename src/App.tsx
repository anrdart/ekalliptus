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
import { CheckoutProvider } from "@/context/CheckoutContext";
const Order = lazy(() => import("./pages/Order"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Payment = lazy(() => import("./pages/Payment"));
const PaymentFinish = lazy(() => import("./pages/PaymentFinish"));
const PaymentUnfinish = lazy(() => import("./pages/PaymentUnfinish"));
const PaymentHistory = lazy(() => import("./pages/PaymentHistory"));
const PaymentTest = lazy(() => import("./pages/PaymentTest"));
const Error = lazy(() => import("./pages/Error"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BackgroundFX />
        <CustomCursor />
        <CheckoutProvider>
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
                  path="/order-confirmation"
                  element={
                    <Suspense fallback={<div className="p-10 text-center text-foreground/80">Memuat...</div>}>
                      <OrderConfirmation />
                    </Suspense>
                  }
                />
                <Route
                  path="/payment"
                  element={
                    <Suspense fallback={<div className="p-10 text-center text-foreground/80">Memuat...</div>}>
                      <Payment />
                    </Suspense>
                  }
                />
                <Route
                  path="/payment/finish"
                  element={
                    <Suspense fallback={<div className="p-10 text-center text-foreground/80">Memuat...</div>}>
                      <PaymentFinish />
                    </Suspense>
                  }
                />
                <Route
                  path="/payment/unfinish"
                  element={
                    <Suspense fallback={<div className="p-10 text-center text-foreground/80">Memuat...</div>}>
                      <PaymentUnfinish />
                    </Suspense>
                  }
                />
                <Route
                  path="/payment/history"
                  element={
                    <Suspense fallback={<div className="p-10 text-center text-foreground/80">Memuat...</div>}>
                      <PaymentHistory />
                    </Suspense>
                  }
                />
                <Route
                  path="/payment/test"
                  element={
                    <Suspense fallback={<div className="p-10 text-center text-foreground/80">Memuat...</div>}>
                      <PaymentTest />
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
        </CheckoutProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
