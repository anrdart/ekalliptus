import React, { useState, useEffect } from 'react';
import { Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  created_at: string;
  user_id: string | null;
  new_values: any;
}

export default function ActivityFeed() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs?page=1');
      if (!res.ok) throw new Error('Gagal memuat log aktivitas');
      const data = await res.json();
      setLogs(data.logs || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Polling setiap 10 detik
    const interval = setInterval(() => {
      fetchLogs();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading && logs.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-sm text-muted-foreground animate-pulse">
        Memuat aktivitas terbaru...
      </div>
    );
  }

  if (error && logs.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col h-full max-h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Live Activity Log
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Monitoring
        </div>
      </div>

      <div className="overflow-y-auto pr-2 space-y-4 flex-1 custom-scrollbar">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Belum ada aktivitas tercatat.</p>
        ) : (
          logs.slice(0, 15).map((log) => (
            <div key={log.id} className="relative pl-4 border-l border-border pb-1 last:pb-0">
              <div className="absolute w-2 h-2 bg-primary rounded-full -left-[5px] top-1.5" />
              <div className="text-sm font-medium">
                <span className="text-primary capitalize">{log.action}</span> pada <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{log.table_name}</span>
              </div>
              {log.new_values?.title && (
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  "{log.new_values.title}"
                </div>
              )}
              {log.new_values?.name && (
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  "{log.new_values.name}"
                </div>
              )}
              <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: id })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}