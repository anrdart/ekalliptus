import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bug, 
  Download, 
  RefreshCw, 
  Trash2, 
  Eye, 
  EyeOff,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { paymentLogger, LogLevel, PaymentAnalytics } from '@/services/paymentLogger';

interface PaymentDebugPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

const PaymentDebugPanel: React.FC<PaymentDebugPanelProps> = ({ isVisible, onToggle }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLogLevel, setSelectedLogLevel] = useState<LogLevel | 'all'>('all');
  const [showTimestamp, setShowTimestamp] = useState(true);

  // Refresh data
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const latestLogs = paymentLogger.getLogs({ limit: 100 });
      const latestAnalytics = paymentLogger.getAnalytics();
      
      setLogs(latestLogs);
      setAnalytics(latestAnalytics);
    } catch (error) {
      console.error('Error refreshing debug data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto refresh every 5 seconds
  useEffect(() => {
    if (!isVisible) return;

    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [isVisible]);

  // Filter logs based on selected level
  const filteredLogs = selectedLogLevel === 'all' 
    ? logs 
    : logs.filter(log => log.level === selectedLogLevel);

  // Get log level color
  const getLogLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case LogLevel.INFO:
        return 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary';
      case LogLevel.WARN:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case LogLevel.ERROR:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get log level icon
  const getLogLevelIcon = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG:
        return <Info className="h-3 w-3" />;
      case LogLevel.INFO:
        return <CheckCircle2 className="h-3 w-3" />;
      case LogLevel.WARN:
        return <AlertTriangle className="h-3 w-3" />;
      case LogLevel.ERROR:
        return <XCircle className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    if (!showTimestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // Export logs
  const exportLogs = (format: 'json' | 'csv') => {
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        content = paymentLogger.exportLogs({ level: selectedLogLevel === 'all' ? undefined : selectedLogLevel });
        filename = `payment-logs-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        content = paymentLogger.exportLogsToCsv({ level: selectedLogLevel === 'all' ? undefined : selectedLogLevel });
        filename = `payment-logs-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  // Clear logs
  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      paymentLogger.clearLogs();
      setLogs([]);
      setAnalytics(null);
    }
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 bg-background shadow-lg"
      >
        <Bug className="mr-2 h-4 w-4" />
        Debug Panel
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] bg-background shadow-lg border rounded-lg">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              <CardTitle className="text-sm">Payment Debug Panel</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">
            Real-time payment monitoring and debugging
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="logs" className="h-full">
            <TabsList className="grid w-full grid-cols-3 m-2">
              <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
              <TabsTrigger value="tools" className="text-xs">Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="mt-0">
              <div className="p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      variant={selectedLogLevel === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedLogLevel('all')}
                      className="text-xs h-6"
                    >
                      All
                    </Button>
                    <Button
                      variant={selectedLogLevel === LogLevel.ERROR ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedLogLevel(LogLevel.ERROR)}
                      className="text-xs h-6"
                    >
                      Errors
                    </Button>
                    <Button
                      variant={selectedLogLevel === LogLevel.WARN ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedLogLevel(LogLevel.WARN)}
                      className="text-xs h-6"
                    >
                      Warnings
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTimestamp(!showTimestamp)}
                    className="text-xs h-6"
                  >
                    <Clock className="h-3 w-3" />
                  </Button>
                </div>

                <ScrollArea className="h-64 w-full rounded-md border p-2">
                  <div className="space-y-1">
                    {filteredLogs.length === 0 ? (
                      <div className="text-center text-xs text-muted-foreground py-4">
                        No logs to display
                      </div>
                    ) : (
                      filteredLogs.map((log, index) => (
                        <div key={index} className="text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getLogLevelColor(log.level)}`}>
                              {getLogLevelIcon(log.level)}
                              <span className="ml-1">{log.level}</span>
                            </Badge>
                            <span className="text-muted-foreground">
                              {formatTimestamp(log.timestamp)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {log.category}
                            </Badge>
                          </div>
                          <div className="ml-2">
                            <p className="font-medium">{log.message}</p>
                            {log.data && (
                              <details className="mt-1">
                                <summary className="cursor-pointer text-muted-foreground">
                                  Data
                                </summary>
                                <pre className="mt-1 text-xs bg-muted p-1 rounded overflow-auto">
                                  {JSON.stringify(log.data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                          {index < filteredLogs.length - 1 && <Separator className="my-2" />}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <div className="p-2 space-y-4">
                {analytics ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-muted p-2 rounded">
                        <div className="font-semibold">Total</div>
                        <div className="text-lg">{analytics.totalTransactions}</div>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded">
                        <div className="font-semibold text-green-800 dark:text-green-400">Success</div>
                        <div className="text-lg text-green-800 dark:text-green-400">{analytics.successfulTransactions}</div>
                      </div>
                      <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded">
                        <div className="font-semibold text-red-800 dark:text-red-400">Failed</div>
                        <div className="text-lg text-red-800 dark:text-red-400">{analytics.failedTransactions}</div>
                      </div>
                      <div className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded">
                        <div className="font-semibold text-yellow-800 dark:text-yellow-400">Pending</div>
                        <div className="text-lg text-yellow-800 dark:text-yellow-400">{analytics.pendingTransactions}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Payment Methods</h4>
                      <div className="space-y-1">
                        {Object.entries(analytics.paymentMethodStats).map(([method, count]) => (
                          <div key={method} className="flex justify-between text-xs">
                            <span className="capitalize">{method}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(analytics.lastUpdated).toLocaleString('id-ID')}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No analytics data available
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tools" className="mt-0">
              <div className="p-2 space-y-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Export Logs</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportLogs('json')}
                      className="text-xs"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      JSON
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportLogs('csv')}
                      className="text-xs"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      CSV
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Debug Actions</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={refreshData}
                    disabled={isRefreshing}
                    className="w-full text-xs"
                  >
                    <RefreshCw className={`mr-1 h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={clearLogs}
                    className="w-full text-xs"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Clear All Logs
                  </Button>
                </div>

                <Separator />

                <div className="text-xs text-muted-foreground">
                  <div className="space-y-1">
                    <p>• Logs are stored in memory and localStorage</p>
                    <p>• Auto-refresh every 5 seconds</p>
                    <p>• Max 1000 logs kept in memory</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentDebugPanel;