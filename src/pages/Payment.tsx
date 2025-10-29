import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { processPayment } from "@/lib/midtrans";
import { MidtransSnapParams, MidtransCallbackResult } from "@/config/midtrans";
import PaymentMethodSelector, { PaymentMethod } from "@/components/PaymentMethodSelector";
import PaymentStatusMonitor from "@/components/PaymentStatusMonitor";
import { CreditCard, ShoppingCart, User, Mail, Phone, Loader2, CheckCircle2, XCircle, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { useCheckout } from "@/context/CheckoutContext";
import { orderApi } from "@/services/orderApi";
import { paymentLogger, PaymentEventType, logPaymentEvent, logValidationError, logUiEvent, logApiEvent, logWebhookEvent } from "@/services/paymentLogger";
import PaymentDebugPanel from "@/components/PaymentDebugPanel";
import "@/components/PaymentButton.css";

interface PaymentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface OrderSummary {
  itemName: string;
  itemPrice: number;
  itemQty: number;
  subtotal: number;
  baseFees: number;
  baseTotal: number;
  currency: string;
}

const PAYMENT_LOGGING_ENABLED = import.meta.env.VITE_ENABLE_PAYMENT_LOGGING === "true";

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { session, attachmentFile, updateCheckoutSession, clearCheckoutSession } = useCheckout();

  const parsedCustomer = useMemo(() => {
    if (!session?.customer) {
      return {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      };
    }

    const parts = (session.customer.name || "").trim().split(/\s+/);
    const firstName = parts.shift() ?? "";
    const lastName = parts.join(" ");

    return {
      firstName: firstName || session.customer.name || "",
      lastName,
      email: session.customer.email || "",
      phone: session.customer.whatsapp || "",
    };
  }, [session?.customer]);

  const [formData, setFormData] = useState<PaymentFormData>(parsedCustomer);

  useEffect(() => {
    setFormData(parsedCustomer);
  }, [parsedCustomer]);

  const baseOrderSummary = useMemo<OrderSummary>(() => {
    if (session?.payment) {
      return {
        itemName: session.payment.itemName,
        itemPrice: session.payment.itemPrice,
        itemQty: session.payment.itemQty,
        subtotal: session.payment.subtotal ?? session.payment.itemPrice * session.payment.itemQty,
        baseFees: session.payment.fees ?? 0,
        baseTotal: session.payment.total,
        currency: session.payment.currency,
      };
    }

    const itemName = searchParams.get("item") || "Produk";
    const itemPrice = parseInt(searchParams.get("price") || "0", 10);
    const itemQty = parseInt(searchParams.get("qty") || "1", 10);
    const subtotal = itemPrice * itemQty;

    return {
      itemName,
      itemPrice,
      itemQty,
      subtotal,
      baseFees: 0,
      baseTotal: subtotal,
      currency: "IDR",
    };
  }, [session?.payment, searchParams]);

  const [orderSummary, setOrderSummary] = useState<OrderSummary>(baseOrderSummary);

  useEffect(() => {
    setOrderSummary(baseOrderSummary);
  }, [baseOrderSummary]);

  const submissionSummaryItems = useMemo(() => {
    if (!session?.submissionSummary) {
      return [];
    }
    return [
      { label: "Perusahaan", value: session.submissionSummary.perusahaan },
      { label: "Jabatan", value: session.submissionSummary.jabatan },
      { label: "Website", value: session.submissionSummary.website },
      { label: "Scope", value: session.submissionSummary.scope },
      { label: "Anggaran", value: session.submissionSummary.anggaran },
      { label: "Timeline", value: session.submissionSummary.timeline },
      { label: "Deadline", value: session.submissionSummary.deadline },
      { label: "Zona Waktu", value: session.submissionSummary.zonaWaktu },
      { label: "Tujuan", value: session.submissionSummary.tujuan },
      { label: "Referensi", value: session.submissionSummary.referensi },
      { label: "Deskripsi", value: session.submissionSummary.deskripsi },
    ].filter((item) => item.value && item.value !== "-");
  }, [session?.submissionSummary]);

  const serviceDetailItems = useMemo(() => {
    if (!session?.service?.details) {
      return [];
    }

    return Object.entries(session.service.details).filter(
      ([, value]) => typeof value === "string" && value.trim().length > 0,
    );
  }, [session?.service?.details]);

  const formatDetailLabel = (label: string) =>
    label
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^./, (char) => char.toUpperCase());

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(
    session?.payment?.orderId ?? session?.orderId ?? searchParams.get('order_id'),
  );
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [existingPaymentStatus, setExistingPaymentStatus] = useState<any>(null);

  useEffect(() => {
    if (session?.payment?.orderId) {
      setCompletedOrderId(session.payment.orderId);
    }
  }, [session?.payment?.orderId]);

  // Check for existing payment status if order_id is in URL but no session
  useEffect(() => {
    const checkExistingPayment = async () => {
      if (!session?.payment && completedOrderId) {
        try {
          logPaymentEvent(PaymentEventType.PAYMENT_INIT, {
            orderId: completedOrderId,
            source: 'direct_url_access',
          }, completedOrderId);

          // Try to get payment status
          const { getPaymentStatus } = await import('@/lib/midtrans');
          const status = await getPaymentStatus(completedOrderId);

          if (status) {
            setExistingPaymentStatus(status);
            logPaymentEvent(PaymentEventType.API_SUCCESS, {
              orderId: completedOrderId,
              status: status.transaction_status,
            }, completedOrderId);

            // Auto-redirect based on status
            if (status.transaction_status === 'settlement' || status.transaction_status === 'capture') {
              navigate(`/payment/finish?order_id=${completedOrderId}`);
              return;
            } else if (['deny', 'cancel', 'expire'].includes(status.transaction_status)) {
              navigate(`/payment/unfinish?order_id=${completedOrderId}`);
              return;
            } else {
              // Payment exists but still pending, show appropriate message
              setIsLoading(false);
              return;
            }
          }
        } catch (error) {
          // Payment not found or error occurred
          logValidationError('Failed to load existing payment', { orderId: completedOrderId, error });
        }
      }
    };

    checkExistingPayment();
  }, [session?.payment, completedOrderId]);

  const getTotalAmount = () => {
    const baseTotal = orderSummary.baseTotal;
    if (!selectedPaymentMethod) return baseTotal;

    const fee = selectedPaymentMethod.fee
      ? selectedPaymentMethod.fee.type === "fixed"
        ? selectedPaymentMethod.fee.amount
        : (baseTotal * selectedPaymentMethod.fee.amount) / 100
      : 0;

    return baseTotal + fee;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    logUiEvent(`Form field changed: ${name}`, {
      fieldName: name,
      value: value,
      currentStep,
    }, completedOrderId);
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!formData.firstName.trim()) {
      errors.push('Nama depan harus diisi');
    }

    if (!formData.email.trim()) {
      errors.push('Email harus diisi');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Format email tidak valid');
    }

    if (!formData.phone.trim()) {
      errors.push('Nomor telepon harus diisi');
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.push('Format nomor telepon tidak valid');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validatePayment = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!selectedPaymentMethod) {
      errors.push('Pilih metode pembayaran terlebih dahulu');
    }

    const totalAmount = getTotalAmount();
    if (totalAmount <= 0) {
      errors.push('Total pembayaran tidak valid');
    }

    if (!session?.payment || !session.customer || !session.service) {
      errors.push('Sesi checkout tidak lengkap. Silakan mulai ulang proses order.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleNextStep = () => {
    logUiEvent(`Navigation to step ${currentStep + 1}`, {
      currentStep,
      selectedPaymentMethod: selectedPaymentMethod?.id,
      formData,
    }, completedOrderId);

    if (currentStep === 1) {
      const validation = validateForm();
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          toast({
            title: 'Error Validasi',
            description: error,
            variant: 'destructive',
          });
        });
        return;
      }
    }
    
    if (currentStep === 2) {
      const validation = validatePayment();
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          toast({
            title: 'Error Validasi',
            description: error,
            variant: 'destructive',
          });
        });
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    logUiEvent(`Navigation to step ${currentStep - 1}`, {
      currentStep,
      selectedPaymentMethod: selectedPaymentMethod?.id,
    }, completedOrderId);

    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePayment = async () => {
    const orderId = session?.payment?.orderId || completedOrderId;
    
    // Reset error state
    setPaymentError(null);
    
    logPaymentEvent(PaymentEventType.FORM_SUBMIT, {
      selectedPaymentMethod: selectedPaymentMethod?.id,
      totalAmount: getTotalAmount(),
      formData,
    }, orderId);

    // Validasi pembayaran
    const validation = validatePayment();
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        toast({
          title: 'Error Validasi',
          description: error,
          variant: 'destructive',
        });
      });
      return;
    }

    setIsLoading(true);
    setIsPaymentProcessing(true);
    setCompletedOrderId(orderId);

    const updatedCustomer = {
      name: `${formData.firstName} ${formData.lastName}`.trim() || session.customer.name,
      email: formData.email.trim(),
      whatsapp: formData.phone.trim(),
      contactPreference: session.customer.contactPreference,
    };

    logPaymentEvent(PaymentEventType.PAYMENT_INIT, {
      orderId,
      totalAmount: getTotalAmount(),
      paymentMethod: selectedPaymentMethod.id,
      customerData: updatedCustomer,
    }, orderId);

    const totalAmount = getTotalAmount();
    const additionalFee =
      selectedPaymentMethod.fee && selectedPaymentMethod.fee.type === "percentage"
        ? Math.round((orderSummary.baseTotal * selectedPaymentMethod.fee.amount) / 100)
        : selectedPaymentMethod.fee?.amount ?? 0;

    updateCheckoutSession({
      customer: updatedCustomer,
      status: "pending",
      payment: {
        ...session.payment,
        total: totalAmount,
        metadata: {
          ...session.payment.metadata,
          paymentMethod: selectedPaymentMethod.id,
          paymentMethodName: selectedPaymentMethod.name,
          additionalFee,
        },
      },
    });

    const paymentParams: MidtransSnapParams = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalAmount,
      },
      item_details: [
        {
          id: session.service.serviceId || "item-1",
          price: orderSummary.itemPrice,
          quantity: orderSummary.itemQty,
          name: orderSummary.itemName,
        },
        ...(additionalFee > 0
          ? [
              {
                id: `fee-${selectedPaymentMethod.id}`,
                price: additionalFee,
                quantity: 1,
                name: `Biaya ${selectedPaymentMethod.name}`,
              },
            ]
          : []),
      ],
      customer_details: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: updatedCustomer.email,
        phone: updatedCustomer.whatsapp,
      },
    };

    updateCheckoutSession({ snapParams: paymentParams });

    const syncPayment = async (status: string, result: MidtransCallbackResult) => {
      const startTime = Date.now();
      
      try {
        logApiEvent(PaymentEventType.API_CALL, {
          endpoint: 'finalizeCheckout',
          orderId,
          paymentStatus: status,
        }, orderId);

        const finalizeResult = await orderApi.finalizeCheckout({
          orderId,
          paymentStatus: status,
          paymentResult: result,
          customer: updatedCustomer,
          service: session.service,
          submissionSummary: session.submissionSummary,
          attachmentMeta: session.attachmentMeta ?? undefined,
          attachmentFile,
        });

        const duration = Date.now() - startTime;

        if (finalizeResult.success) {
          logApiEvent(PaymentEventType.API_SUCCESS, {
            endpoint: 'finalizeCheckout',
            orderId,
            duration,
            result: finalizeResult.data,
          }, orderId);
        } else {
          logApiEvent(PaymentEventType.API_ERROR, {
            endpoint: 'finalizeCheckout',
            orderId,
            duration,
            error: finalizeResult.error,
          }, orderId);
          
          toast({
            title: "Sinkronisasi gagal",
            description: finalizeResult.error || "Data pembayaran belum tersimpan di server.",
            variant: "destructive",
          });
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        logApiEvent(PaymentEventType.API_ERROR, {
          endpoint: 'finalizeCheckout',
          orderId,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
        }, orderId);
        
        toast({
          title: "Sinkronisasi gagal",
          description: error instanceof Error ? error.message : "Terjadi kesalahan saat sinkronisasi.",
          variant: "destructive",
        });
      }
    };

    const processPaymentWithRetry = async (retryAttempt = 0) => {
      try {
        logPaymentEvent(PaymentEventType.REDIRECT_SUCCESS, {
          orderId,
          paymentGateway: 'Midtrans',
          snapParams: paymentParams,
          retryAttempt,
        }, orderId);

        await processPayment(paymentParams, {
          onSuccess: async (result: MidtransCallbackResult) => {
            logPaymentEvent(PaymentEventType.PAYMENT_SUCCESS, {
              orderId: result.order_id,
              transactionId: result.transaction_id,
              paymentType: result.payment_type,
              transactionTime: result.transaction_time,
            }, result.order_id);
            
            updateCheckoutSession({ status: "paid" });
            await syncPayment(result.transaction_status ?? "settlement", result);
            toast({
              title: "Pembayaran Berhasil!",
              description: `Order ID: ${result.order_id}`,
            });
            setIsLoading(false);
            setIsPaymentProcessing(false);
            setRetryCount(0);
            setCurrentStep(3);
          },
          onPending: async (result: MidtransCallbackResult) => {
            logPaymentEvent(PaymentEventType.PAYMENT_PENDING, {
              orderId: result.order_id,
              transactionId: result.transaction_id,
              paymentType: result.payment_type,
              transactionTime: result.transaction_time,
            }, result.order_id);
            
            updateCheckoutSession({ status: "pending" });
            await syncPayment(result.transaction_status ?? "pending", result);
            toast({
              title: "Pembayaran Tertunda",
              description: "Menunggu konfirmasi pembayaran",
            });
            setIsLoading(false);
            setIsPaymentProcessing(false);
            setRetryCount(0);
            setCurrentStep(3);
          },
          onError: (result: MidtransCallbackResult) => {
            logPaymentEvent(PaymentEventType.PAYMENT_FAILED, {
              orderId: result.order_id,
              statusCode: result.status_code,
              statusMessage: result.status_message,
              transactionTime: result.transaction_time,
            }, result.order_id);
            
            updateCheckoutSession({ status: "failed" });
            const errorMessage = result.status_message || "Terjadi kesalahan saat memproses pembayaran";
            setPaymentError(errorMessage);
            
            toast({
              title: "Pembayaran Gagal",
              description: errorMessage,
              variant: "destructive",
            });
            setIsLoading(false);
            setIsPaymentProcessing(false);
          },
          onClose: () => {
            logUiEvent("Payment popup closed by user", {
              orderId,
              step: currentStep,
            }, orderId);
            setIsLoading(false);
            setIsPaymentProcessing(false);
          },
        });
      } catch (error) {
        logPaymentEvent(PaymentEventType.PAYMENT_FAILED, {
          orderId,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          retryAttempt,
        }, orderId);
        
        // Retry logic for network errors
        if (retryAttempt < 2 && error instanceof Error &&
            (error.message.includes('network') || error.message.includes('timeout'))) {
          setRetryCount(retryAttempt + 1);
          toast({
            title: "Koneksi Bermasalah",
            description: `Mencoba kembali... Percobaan ${retryAttempt + 1} dari 3`,
            variant: "default",
          });
          
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, retryAttempt) * 1000;
          setTimeout(() => processPaymentWithRetry(retryAttempt + 1), delay);
        } else {
          updateCheckoutSession({ status: "failed" });
          const errorMessage = error instanceof Error ? error.message : "Gagal memproses pembayaran";
          setPaymentError(errorMessage);
          
          toast({
            title: "Pembayaran Gagal",
            description: errorMessage,
            variant: "destructive",
          });
          setIsLoading(false);
          setIsPaymentProcessing(false);
        }
      }
    };

    // Start payment process with retry mechanism
    processPaymentWithRetry();
  };

  const handleRetryPayment = () => {
    setRetryCount(0);
    setPaymentError(null);
    handlePayment();
  };

  const handleStatusChange = (status: string) => {
    const orderId = completedOrderId ?? session?.payment?.orderId ?? session?.orderId;
    
    logWebhookEvent(PaymentEventType.WEBHOOK_RECEIVED, {
      originalStatus: status,
      timestamp: new Date().toISOString(),
    }, orderId);

    // Map Midtrans status to CheckoutSession status
    let mappedStatus: "draft" | "pending" | "paid" | "failed" | "cancelled";
    
    switch (status) {
      case "settlement":
      case "capture":
        mappedStatus = "paid";
        logPaymentEvent(PaymentEventType.PAYMENT_SUCCESS, {
          source: 'webhook',
          originalStatus: status,
        }, orderId);
        break;
      case "pending":
        mappedStatus = "pending";
        logPaymentEvent(PaymentEventType.PAYMENT_PENDING, {
          source: 'webhook',
          originalStatus: status,
        }, orderId);
        break;
      case "deny":
      case "expire":
        mappedStatus = "failed";
        logPaymentEvent(PaymentEventType.PAYMENT_FAILED, {
          source: 'webhook',
          originalStatus: status,
        }, orderId);
        break;
      case "cancel":
        mappedStatus = "cancelled";
        logPaymentEvent(PaymentEventType.PAYMENT_CANCELLED, {
          source: 'webhook',
          originalStatus: status,
        }, orderId);
        break;
      default:
        mappedStatus = "pending";
        logWebhookEvent(PaymentEventType.WEBHOOK_FAILED, {
          message: `Unknown status: ${status}`,
          originalStatus: status,
        }, orderId);
    }

    updateCheckoutSession({ status: mappedStatus });

    if (!orderId) {
      logValidationError("Order ID not found for status change", { status, orderId });
      return;
    }

    let redirectPath: string | null = null;
    if (status === "settlement" || status === "capture") {
      redirectPath = "/payment/finish";
      logPaymentEvent(PaymentEventType.REDIRECT_SUCCESS, {
        destination: 'payment/finish',
        trigger: 'webhook',
      }, orderId);
    } else if (status === "deny" || status === "cancel" || status === "expire") {
      redirectPath = "/payment/unfinish";
      logPaymentEvent(PaymentEventType.REDIRECT_SUCCESS, {
        destination: 'payment/unfinish',
        trigger: 'webhook',
      }, orderId);
    }

    if (!redirectPath) {
      logWebhookEvent(PaymentEventType.REDIRECT_FAILED, {
        reason: 'No redirect path determined',
        status,
      }, orderId);
      return;
    }

    setTimeout(() => {
      navigate(`${redirectPath}?order_id=${orderId}`);
      clearCheckoutSession();
    }, 1500);
  };

  if (!session?.payment) {
    const hasOrderIdInUrl = searchParams.get('order_id');

    return (
      <>
        <Helmet>
          <title>Payment - Ekalliptus</title>
          <meta name="description" content="Halaman pembayaran dengan Midtrans" />
        </Helmet>

        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-6 w-6 text-destructive" />
                  {hasOrderIdInUrl ? 'Sesi Pembayaran Tidak Aktif' : 'Sesi Pembayaran Tidak Ditemukan'}
                </CardTitle>
                <CardDescription>
                  {hasOrderIdInUrl
                    ? `Pembayaran untuk order ${hasOrderIdInUrl} tidak dapat dilanjutkan. Sesi mungkin telah berakhir atau pembayaran belum dibuat.`
                    : 'Kami tidak menemukan data checkout aktif. Mulai ulang proses order untuk melanjutkan pembayaran.'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {hasOrderIdInUrl ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Sesi pembayaran berlaku selama proses order berlangsung.
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Mulai ulang proses order dengan memilih layanan terlebih dahulu.
                    </div>
                    {existingPaymentStatus && (
                      <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-yellow-800">
                        <p className="font-medium">Status Pembayaran: {existingPaymentStatus.transaction_status}</p>
                        {existingPaymentStatus.payment_type && (
                          <p className="text-sm">Metode: {existingPaymentStatus.payment_type}</p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Data checkout hanya tersedia selama sesi pemesanan berjalan.
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Isi formulir order terlebih dahulu, lalu lanjutkan ke pembayaran.
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate("/order")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Form Order
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Payment - Ekalliptus</title>
        <meta name="description" content="Halaman pembayaran dengan Midtrans" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
              Checkout Pembayaran
            </h1>
            <p className="text-muted-foreground">
              Lengkapi data Anda untuk melanjutkan pembayaran
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    currentStep >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 font-medium">Informasi</span>
                </div>
                <div className={`h-0.5 w-8 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    currentStep >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 font-medium">Pembayaran</span>
                </div>
                <div className={`h-0.5 w-8 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`flex items-center ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    currentStep >= 3 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                  }`}>
                    3
                  </div>
                  <span className="ml-2 font-medium">Konfirmasi</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informasi Pelanggan
                    </CardTitle>
                    <CardDescription>
                      Masukkan data Anda untuk proses pembayaran
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nama Depan *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nama Belakang</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Nomor Telepon *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+62812345678"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <PaymentMethodSelector
                  amount={orderSummary.baseTotal}
                  selectedMethod={selectedPaymentMethod?.id}
                  onMethodChange={setSelectedPaymentMethod}
                  disabled={isLoading}
                />
              )}

              {currentStep === 3 && completedOrderId && (
                <PaymentStatusMonitor
                  orderId={completedOrderId}
                  onStatusChange={handleStatusChange}
                  autoRefresh={true}
                />
              )}
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Ringkasan Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Produk</span>
                      <span className="font-medium">{orderSummary.itemName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Harga</span>
                      <span>Rp {orderSummary.itemPrice.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Jumlah</span>
                      <span>{orderSummary.itemQty}x</span>
                    </div>
                    {orderSummary.baseFees > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Biaya Tambahan</span>
                        <span>Rp {orderSummary.baseFees.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                  {selectedPaymentMethod?.fee && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Biaya Layanan</span>
                        <span>
                          Rp {(
                            selectedPaymentMethod.fee.type === "fixed"
                              ? selectedPaymentMethod.fee.amount
                              : (orderSummary.baseTotal * selectedPaymentMethod.fee.amount) / 100
                          ).toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                  </div>

                  <Tabs defaultValue="summary" className="pt-2">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="summary">Ringkasan</TabsTrigger>
                      <TabsTrigger value="details">Detail Layanan</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary" className="space-y-2 pt-4 text-xs text-muted-foreground">
                      {submissionSummaryItems.length > 0 ? (
                        submissionSummaryItems.map((item) => (
                          <div key={item.label} className="flex justify-between gap-3">
                            <span className="font-medium text-foreground">{item.label}</span>
                            <span className="text-right text-muted-foreground">{item.value}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">Ringkasan order akan muncul setelah formulir terisi.</p>
                      )}
                    </TabsContent>
                    <TabsContent value="details" className="space-y-2 pt-4 text-xs text-muted-foreground">
                      {serviceDetailItems.length > 0 ? (
                        serviceDetailItems.map(([key, value]) => (
                          <div key={key} className="flex justify-between gap-3">
                            <span className="font-medium text-foreground">{formatDetailLabel(key)}</span>
                            <span className="text-right text-muted-foreground">{value}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">Detail layanan tambahan tidak tersedia.</p>
                      )}
                    </TabsContent>
                  </Tabs>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      Rp {getTotalAmount().toLocaleString('id-ID')}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="space-y-2">
                  {currentStep === 1 && (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleNextStep}
                      disabled={isLoading}
                    >
                      Lanjutkan
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  
                  {currentStep === 2 && (
                    <div className="payment-actions">
                      {/* Primary Payment Button */}
                      <div className="payment-button-container">
                        <Button
                          className={`payment-button w-full ${isPaymentProcessing ? "loading" : ""}`}
                          size="lg"
                          onClick={handlePayment}
                          disabled={isPaymentProcessing || !selectedPaymentMethod}
                          type="button"
                        >
                          {isPaymentProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span>Memproses Pembayaran...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4 payment-method-icon" />
                              <span>Bayar Sekarang</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Error Display */}
                      {paymentError && (
                        <div className="payment-error-container">
                          <div className="flex items-start gap-2">
                            <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-destructive">Pembayaran Gagal</p>
                              <p className="mt-1 text-xs text-destructive/80">{paymentError}</p>
                              {retryCount > 0 && (
                                <p className="mt-1 text-xs text-muted-foreground">Percobaan ke-{retryCount} dari 3</p>
                              )}
                            </div>
                          </div>
                          {retryCount < 3 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRetryPayment}
                              disabled={isPaymentProcessing}
                              className="retry-button"
                            >
                              {isPaymentProcessing ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Mencoba lagi...
                                </>
                              ) : (
                                <>Coba Lagi</>
                              )}
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Back Button */}
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handlePrevStep}
                        disabled={isPaymentProcessing}
                        className="payment-secondary-button w-full"
                        type="button"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                      </Button>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/payment/history')}
                    >
                      Lihat Riwayat Pembayaran
                    </Button>
                  )}
                </CardFooter>
              </Card>

              
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Payment;
