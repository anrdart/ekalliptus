import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { processPayment, generateOrderId } from '@/lib/midtrans';
import { testWebhookHandler, simulateWebhookCall } from '@/services/webhookHandler';
import { paymentApi } from '@/services/paymentApi';
import { MidtransSnapParams } from '@/config/midtrans';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  QrCode, 
  Store, 
  Wallet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  Download
} from 'lucide-react';

// Test payment methods
const TEST_PAYMENT_METHODS = [
  {
    id: 'credit_card',
    name: 'Kartu Kredit/Debit',
    icon: CreditCard,
    testCards: [
      { type: 'Visa Success', number: '4811111111111114', cvv: '123', expiry: '12/25' },
      { type: 'Mastercard Success', number: '5211111111111117', cvv: '123', expiry: '12/25' },
      { type: 'Challenge (3DS)', number: '4911111111111113', cvv: '123', expiry: '12/25' },
      { type: 'Deny', number: '4511111111111116', cvv: '123', expiry: '12/25' },
    ],
  },
  {
    id: 'gopay',
    name: 'GoPay',
    icon: Smartphone,
    description: 'Instant confirmation',
  },
  {
    id: 'ovo',
    name: 'OVO',
    icon: Wallet,
    description: 'Instant confirmation',
  },
  {
    id: 'dana',
    name: 'DANA',
    icon: Wallet,
    description: 'Instant confirmation',
  },
  {
    id: 'bca_va',
    name: 'BCA Virtual Account',
    icon: Building2,
    description: 'Konfirmasi otomatis',
  },
  {
    id: 'bni_va',
    name: 'BNI Virtual Account',
    icon: Building2,
    description: 'Konfirmasi otomatis',
  },
  {
    id: 'bri_va',
    name: 'BRI Virtual Account',
    icon: Building2,
    description: 'Konfirmasi otomatis',
  },
  {
    id: 'qris',
    name: 'QRIS',
    icon: QrCode,
    description: 'Scan QR dengan aplikasi apapun',
  },
  {
    id: 'alfamart',
    name: 'Alfamart',
    icon: Store,
    description: 'Bayar di gerai Alfamart',
  },
];

const PaymentTest = () => {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);

  // Test individual payment method
  const testPaymentMethod = async (method: any) => {
    const orderId = generateOrderId();
    const testId = `${method.id}-${Date.now()}`;
    
    setTestResults(prev => ({
      ...prev,
      [testId]: { status: 'running', method: method.name, orderId }
    }));

    try {
      const paymentParams: MidtransSnapParams = {
        transaction_details: {
          order_id: orderId,
          gross_amount: 10000, // Small amount for testing
        },
        item_details: [
          {
            id: 'test-item',
            price: 10000,
            quantity: 1,
            name: `Test ${method.name}`,
          },
        ],
        customer_details: {
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          phone: '+62812345678',
        },
      };

      await processPayment(paymentParams, {
        onSuccess: (result) => {
          setTestResults(prev => ({
            ...prev,
            [testId]: { 
              ...prev[testId], 
              status: 'success', 
              result,
              completedAt: new Date().toISOString()
            }
          }));
          toast({
            title: `Test ${method.name} - Success`,
            description: `Order ID: ${result.order_id}`,
          });
        },
        onPending: (result) => {
          setTestResults(prev => ({
            ...prev,
            [testId]: { 
              ...prev[testId], 
              status: 'pending', 
              result,
              completedAt: new Date().toISOString()
            }
          }));
          toast({
            title: `Test ${method.name} - Pending`,
            description: `Order ID: ${result.order_id}`,
          });
        },
        onError: (result) => {
          setTestResults(prev => ({
            ...prev,
            [testId]: { 
              ...prev[testId], 
              status: 'error', 
              result,
              completedAt: new Date().toISOString()
            }
          }));
          toast({
            title: `Test ${method.name} - Error`,
            description: result.status_message || 'Test failed',
            variant: 'destructive',
          });
        },
        onClose: () => {
          setTestResults(prev => ({
            ...prev,
            [testId]: { 
              ...prev[testId], 
              status: 'closed',
              completedAt: new Date().toISOString()
            }
          }));
        },
      });
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testId]: { 
          ...prev[testId], 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date().toISOString()
        }
      }));
      toast({
        title: `Test ${method.name} - Error`,
        description: error instanceof Error ? error.message : 'Test failed',
        variant: 'destructive',
      });
    }
  };

  // Test webhook scenarios
  const testWebhookScenarios = async () => {
    setIsRunning(true);
    try {
      await testWebhookHandler();
      toast({
        title: 'Webhook Tests Complete',
        description: 'All webhook scenarios tested successfully',
      });
    } catch (error) {
      toast({
        title: 'Webhook Test Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Test API endpoints
  const testApiEndpoints = async () => {
    setIsRunning(true);
    const results: Record<string, any> = {};

    try {
      // Test create transaction
      const createResult = await paymentApi.createTransaction({
        transaction_details: {
          order_id: generateOrderId(),
          gross_amount: 10000,
        },
        customer_details: {
          first_name: 'Test',
          email: 'test@example.com',
          phone: '+62812345678',
        },
      });
      results.createTransaction = createResult;

      // Test get transaction status
      if (createResult.success && createResult.data) {
        const orderId = createResult.data.token.split('-')[1]; // Extract order ID from token
        const statusResult = await paymentApi.getTransactionStatus(orderId);
        results.getTransactionStatus = statusResult;
      }

      // Test get transaction history
      const historyResult = await paymentApi.getTransactionHistory();
      results.getTransactionHistory = historyResult;

      // Test get statistics
      const statsResult = await paymentApi.getPaymentStatistics();
      results.getStatistics = statsResult;

      setTestResults(prev => ({ ...prev, apiTests: results }));
      
      toast({
        title: 'API Tests Complete',
        description: 'All API endpoints tested successfully',
      });
    } catch (error) {
      toast({
        title: 'API Test Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Export test results
  const exportTestResults = () => {
    const dataStr = JSON.stringify(testResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `payment-test-results-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="mr-1 h-3 w-3" />Success</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="mr-1 h-3 w-3" />Error</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="mr-1 h-3 w-3" />Closed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="mr-1 h-3 w-3 animate-spin" />Running</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Payment Integration Test - Ekalliptus</title>
        <meta name="description" content="Test payment integration with Midtrans" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
              Payment Integration Test
            </h1>
            <p className="text-muted-foreground">
              Test and validate all payment methods and integration features
            </p>
          </div>

          <Tabs defaultValue="payment-methods" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="api">API Endpoints</TabsTrigger>
              <TabsTrigger value="results">Test Results</TabsTrigger>
            </TabsList>

            {/* Payment Methods Test */}
            <TabsContent value="payment-methods" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods Testing</CardTitle>
                  <CardDescription>
                    Test each payment method to ensure proper integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {TEST_PAYMENT_METHODS.map((method) => {
                      const MethodIcon = method.icon;
                      return (
                        <Card key={method.id} className="relative">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <MethodIcon className="h-5 w-5" />
                              <CardTitle className="text-sm">{method.name}</CardTitle>
                            </div>
                            {method.description && (
                              <CardDescription className="text-xs">
                                {method.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {method.testCards && (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold">Test Cards:</p>
                                <div className="space-y-1">
                                  {method.testCards.map((card: any, index: number) => (
                                    <div key={index} className="text-xs font-mono bg-muted p-2 rounded">
                                      <div>{card.type}</div>
                                      <div>{card.number}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => testPaymentMethod(method)}
                              disabled={isRunning}
                            >
                              <Play className="mr-2 h-3 w-3" />
                              Test
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Webhooks Test */}
            <TabsContent value="webhooks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Webhook Testing</CardTitle>
                  <CardDescription>
                    Test webhook handling for different notification scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Notification Scenarios</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">Test scenarios:</p>
                        <ul className="text-xs space-y-1">
                          <li>✓ Successful payment (settlement)</li>
                          <li>✓ Pending payment (pending)</li>
                          <li>✓ Denied payment (deny)</li>
                          <li>✓ Cancelled payment (cancel)</li>
                          <li>✓ Expired payment (expire)</li>
                        </ul>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={testWebhookScenarios}
                          disabled={isRunning}
                        >
                          {isRunning ? (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <Play className="mr-2 h-3 w-3" />
                          )}
                          Run Webhook Tests
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Manual Simulation</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Simulate specific webhook events
                        </p>
                        <div className="grid gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => simulateWebhookCall('TEST-ORDER-SUCCESS', 'settlement')}
                          >
                            Simulate Success
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => simulateWebhookCall('TEST-ORDER-FAIL', 'deny')}
                          >
                            Simulate Failure
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Endpoints Test */}
            <TabsContent value="api" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Endpoints Testing</CardTitle>
                  <CardDescription>
                    Test all API endpoints for proper functionality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Endpoints to Test</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <ul className="text-xs space-y-1">
                            <li>✓ Create Transaction</li>
                            <li>✓ Get Transaction Status</li>
                            <li>✓ Get Transaction History</li>
                            <li>✓ Get Payment Statistics</li>
                            <li>✓ Export Transaction Logs</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Test Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={testApiEndpoints}
                            disabled={isRunning}
                          >
                            {isRunning ? (
                              <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                            ) : (
                              <Play className="mr-2 h-3 w-3" />
                            )}
                            Run API Tests
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Test Results */}
            <TabsContent value="results" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Test Results</CardTitle>
                      <CardDescription>
                        Review all test results and export if needed
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={exportTestResults}
                      disabled={Object.keys(testResults).length === 0}
                    >
                      <Download className="mr-2 h-3 w-3" />
                      Export Results
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {Object.keys(testResults).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No test results yet. Run some tests to see results here.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(testResults).map(([testId, result]) => (
                        <Card key={testId} className="relative">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div>
                                  <h4 className="font-semibold">{result.method || testId}</h4>
                                  {result.orderId && (
                                    <p className="text-xs text-muted-foreground font-mono">
                                      Order ID: {result.orderId}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(result.status)}
                                {result.completedAt && (
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(result.completedAt).toLocaleTimeString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            {result.result && (
                              <div className="mt-2">
                                <Separator className="mb-2" />
                                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                  {JSON.stringify(result.result, null, 2)}
                                </pre>
                              </div>
                            )}
                            {result.error && (
                              <div className="mt-2">
                                <Separator className="mb-2" />
                                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                  Error: {result.error}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default PaymentTest;