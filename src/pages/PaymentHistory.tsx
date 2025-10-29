import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { paymentApi } from '@/services/paymentApi';
import { TransactionLog } from '@/services/notificationHandler';
import { 
  Search, 
  Download, 
  Filter, 
  RefreshCw, 
  Eye, 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Home
} from 'lucide-react';

// Type untuk payment statistics
interface PaymentStatistics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalAmount: number;
  successRate: number;
}

// Type untuk filter options
interface FilterOptions {
  orderId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

const PaymentHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<TransactionLog[]>([]);
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);

  // Load data
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load transactions
      const transactionsResponse = await paymentApi.getTransactionHistory(filters);
      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data);
      }

      // Load statistics
      const statsResponse = await paymentApi.getPaymentStatistics({
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      if (statsResponse.success && statsResponse.data) {
        setStatistics(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data transaksi',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    toast({
      title: 'Berhasil',
      description: 'Data berhasil diperbarui',
    });
  };

  // Export data
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await paymentApi.exportTransactionLogs({
        ...filters,
        format: 'csv',
      });

      if (response.success && response.data) {
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: 'Berhasil',
          description: 'Data berhasil diekspor',
        });
      } else {
        throw new Error(response.error || 'Gagal mengekspor data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal mengekspor data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // View transaction details
  const handleViewTransaction = (transaction: TransactionLog) => {
    // Navigate to payment status page with order ID
    navigate(`/payment/unfinish?order_id=${transaction.order_id}`);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'settlement':
      case 'capture':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Berhasil
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <Clock className="mr-1 h-3 w-3" />
            Menunggu
          </Badge>
        );
      case 'deny':
      case 'cancel':
      case 'expire':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Gagal
          </Badge>
        );
      case 'refund':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Dikembalikan
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertTriangle className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  // Load data on mount and filter change
  useEffect(() => {
    loadData();
  }, [filters]);

  return (
    <>
      <Helmet>
        <title>Riwayat Pembayaran - Ekalliptus</title>
        <meta name="description" content="Lihat riwayat pembayaran Anda" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Riwayat Pembayaran
              </h1>
              <p className="text-muted-foreground">
                Lihat dan kelola semua transaksi pembayaran Anda
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
              >
                <Download className={`mr-2 h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filter Transaksi</CardTitle>
                <CardDescription>
                  Filter transaksi berdasarkan kriteria tertentu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderId">Order ID</Label>
                    <Input
                      id="orderId"
                      placeholder="Cari Order ID"
                      value={filters.orderId || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, orderId: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={filters.status || ''}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, status: value || undefined }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Semua Status</SelectItem>
                        <SelectItem value="settlement">Berhasil</SelectItem>
                        <SelectItem value="pending">Menunggu</SelectItem>
                        <SelectItem value="deny">Ditolak</SelectItem>
                        <SelectItem value="cancel">Dibatalkan</SelectItem>
                        <SelectItem value="expire">Kedaluwarsa</SelectItem>
                        <SelectItem value="refund">Dikembalikan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Tanggal Mulai</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={filters.startDate || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Tanggal Selesai</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={filters.endDate || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({})}
                  >
                    Reset Filter
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          {statistics && (
            <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.totalTransactions}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(statistics.totalAmount)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Berhasil</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{statistics.successfulTransactions}</div>
                  <p className="text-xs text-muted-foreground">
                    {statistics.successRate.toFixed(1)}% success rate
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gagal</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{statistics.failedTransactions}</div>
                  <p className="text-xs text-muted-foreground">
                    {statistics.totalTransactions > 0 
                      ? ((statistics.failedTransactions / statistics.totalTransactions) * 100).toFixed(1)
                      : 0}% failure rate
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{statistics.pendingTransactions}</div>
                  <p className="text-xs text-muted-foreground">
                    Menunggu konfirmasi
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Transaksi</CardTitle>
              <CardDescription>
                Menampilkan {transactions.length} transaksi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Tidak ada transaksi ditemukan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Metode</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-mono text-sm">
                            {transaction.order_id}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(transaction.created_at)}
                          </TableCell>
                          <TableCell className="capitalize">
                            {transaction.payment_type.replace('_', ' ')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(transaction.gross_amount)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(transaction.transaction_status)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewTransaction(transaction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              <Home className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentHistory;