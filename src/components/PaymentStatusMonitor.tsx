import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getPaymentStatus } from '@/lib/midtrans';
import { RefreshCw, CheckCircle2, Clock, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

// Type untuk payment status
export type PaymentStatusType = 'pending' | 'success' | 'failed' | 'expired' | 'cancelled' | 'unknown';

// Type untuk payment status info
interface PaymentStatusInfo {
  status: PaymentStatusType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<any>;
}

// Map status ke info
const getStatusInfo = (status: string): PaymentStatusInfo => {
  switch (status.toLowerCase()) {
    case 'settlement':
    case 'capture':
      return {
        status: 'success',
        label: 'Berhasil',
        description: 'Pembayaran telah berhasil diproses',
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        icon: CheckCircle2,
      };
    case 'pending':
      return {
        status: 'pending',
        label: 'Menunggu',
        description: 'Pembayaran sedang menunggu konfirmasi',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        icon: Clock,
      };
    case 'deny':
    case 'cancel':
      return {
        status: 'failed',
        label: 'Ditolak/Dibatalkan',
        description: 'Pembayaran ditolak atau dibatalkan',
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        icon: XCircle,
      };
    case 'expire':
      return {
        status: 'expired',
        label: 'Kedaluwarsa',
        description: 'Waktu pembayaran telah habis',
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        icon: XCircle,
      };
    case 'refund':
      return {
        status: 'failed',
        label: 'Dikembalikan',
        description: 'Pembayaran telah dikembalikan',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        icon: AlertTriangle,
      };
    default:
      return {
        status: 'unknown',
        label: 'Tidak Diketahui',
        description: 'Status pembayaran tidak diketahui',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100 dark:bg-gray-900/20',
        icon: AlertTriangle,
      };
  }
};

// Props untuk PaymentStatusMonitor
interface PaymentStatusMonitorProps {
  orderId: string;
  onStatusChange?: (status: string) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxRetries?: number;
  className?: string;
}

export const PaymentStatusMonitor: React.FC<PaymentStatusMonitorProps> = ({
  orderId,
  onStatusChange,
  autoRefresh = true,
  refreshInterval = 5000, // 5 seconds
  maxRetries = 60, // Max 5 minutes (60 * 5 seconds)
  className = '',
}) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(autoRefresh);
  const [retryCount, setRetryCount] = useState(0);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusInfo = getStatusInfo(status);
  const StatusIcon = statusInfo.icon;

  // Check payment status
  const checkPaymentStatus = useCallback(async (showLoading = true) => {
    if (!orderId) return;

    if (showLoading) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const statusData = await getPaymentStatus(orderId);
      const newStatus = statusData.transaction_status || 'unknown';

      setStatus(newStatus);
      setLastChecked(new Date());
      setError(null);

      // Call callback if status changed
      if (onStatusChange && newStatus !== status) {
        onStatusChange(newStatus);
      }

      // Show toast notification for status changes
      if (newStatus !== status) {
        const newStatusInfo = getStatusInfo(newStatus);
        toast({
          title: `Status Pembayaran Diperbarui`,
          description: newStatusInfo.description,
          variant: newStatusInfo.status === 'success' ? 'default' : 'destructive',
        });
      }

      // Stop auto refresh if payment is complete
      if (newStatus === 'settlement' || newStatus === 'capture' || 
          newStatus === 'deny' || newStatus === 'cancel' || newStatus === 'expire') {
        setIsAutoRefreshing(false);
      }

      return statusData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal memeriksa status pembayaran';
      setError(errorMessage);
      console.error('Error checking payment status:', error);

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      return null;
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [orderId, status, onStatusChange, toast]);

  // Manual refresh
  const handleManualRefresh = () => {
    setRetryCount(0);
    checkPaymentStatus(true);
  };

  // Toggle auto refresh
  const toggleAutoRefresh = () => {
    setIsAutoRefreshing(!isAutoRefreshing);
    if (!isAutoRefreshing) {
      setRetryCount(0);
    }
  };

  // Auto refresh effect
  useEffect(() => {
    if (!isAutoRefreshing || !orderId) return;

    // Check if max retries reached
    if (retryCount >= maxRetries) {
      setIsAutoRefreshing(false);
      toast({
        title: 'Auto Refresh Dihentikan',
        description: 'Mencapai batas maksimum percobaan',
        variant: 'destructive',
      });
      return;
    }

    // Set up interval
    const interval = setInterval(() => {
      checkPaymentStatus(false);
      setRetryCount(prev => prev + 1);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isAutoRefreshing, orderId, retryCount, maxRetries, refreshInterval, checkPaymentStatus, toast]);

  // Initial check
  useEffect(() => {
    if (orderId) {
      checkPaymentStatus(true);
    }
  }, [orderId, checkPaymentStatus]);

  // Listen for payment status updates from notification handler
  useEffect(() => {
    const handlePaymentStatusUpdate = (event: CustomEvent) => {
      const { orderId: updatedOrderId, status: updatedStatus } = event.detail;
      if (updatedOrderId === orderId) {
        setStatus(updatedStatus);
        setLastChecked(new Date());
        setRetryCount(0);

        // Stop auto refresh if payment is complete
        if (updatedStatus === 'settlement' || updatedStatus === 'capture' || 
            updatedStatus === 'deny' || updatedStatus === 'cancel' || updatedStatus === 'expire') {
          setIsAutoRefreshing(false);
        }
      }
    };

    window.addEventListener('paymentStatusUpdated', handlePaymentStatusUpdate as EventListener);
    return () => {
      window.removeEventListener('paymentStatusUpdated', handlePaymentStatusUpdate as EventListener);
    };
  }, [orderId]);

  // Calculate progress
  const getProgress = () => {
    if (status === 'settlement' || status === 'capture') return 100;
    if (status === 'deny' || status === 'cancel' || status === 'expire') return 0;
    return Math.min((retryCount / maxRetries) * 100, 90);
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Status Pembayaran</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoRefresh}
            >
              {isAutoRefreshing ? 'Stop' : 'Start'} Auto
            </Button>
          </div>
        </div>
        <CardDescription>
          Order ID: <span className="font-mono">{orderId}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
            <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{statusInfo.label}</h3>
              <Badge variant={statusInfo.status === 'success' ? 'default' : 'secondary'}>
                {status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
          </div>
        </div>

        {/* Progress Bar */}
        {isAutoRefreshing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Memeriksa status...</span>
              <span>{retryCount}/{maxRetries}</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        )}

        <Separator />

        {/* Last Checked */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Terakhir diperiksa:</span>
          <span>
            {lastChecked ? lastChecked.toLocaleTimeString('id-ID') : 'Belum'}
          </span>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/10">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Auto Refresh Info */}
        {isAutoRefreshing && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-900/10">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Auto refresh aktif, memeriksa status setiap {refreshInterval / 1000} detik
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentStatusMonitor;