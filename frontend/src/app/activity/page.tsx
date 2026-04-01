'use client';

import { useEffect, useState, useCallback } from 'react';
import { Activity, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Log {
    id: string;
    source: string;
    action: string;
    details?: string;
    level: 'info' | 'warn' | 'error' | 'success';
    createdAt: string;
}

const levelConfig = {
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200' },
    warn: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
    error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
};

export default function ActivityPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [levelFilter, setLevelFilter] = useState('all');

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', '50');
        if (levelFilter !== 'all') params.set('level', levelFilter);

        try {
            const res = await fetch(`${API}/api/activity?${params}`, { credentials: 'include' });
            const json = await res.json();
            setLogs(json.data || []);
            setTotal(json.total || 0);
            setPages(json.pages || 1);
        } finally {
            setLoading(false);
        }
    }, [page, levelFilter]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    function timeAgo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'acum';
        if (mins < 60) return `${mins} min`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h`;
        return new Date(dateStr).toLocaleDateString('ro-RO');
    }

    const levels = ['all', 'info', 'success', 'warn', 'error'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Activity size={28} className="text-indigo-500" />
                        Activity Log
                    </h2>
                    <p className="text-gray-500 mt-1">{total} evenimente înregistrate</p>
                </div>
                <button onClick={fetchLogs} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                    Reîncarcă
                </button>
            </div>

            {/* Level filter */}
            <div className="flex gap-2">
                {levels.map(l => (
                    <button
                        key={l}
                        onClick={() => { setLevelFilter(l); setPage(1); }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition capitalize ${levelFilter === l
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        {l === 'all' ? 'Toate' : l}
                    </button>
                ))}
            </div>

            {/* Log entries */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 space-y-3">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Activity size={40} className="mx-auto mb-3 text-gray-300" />
                        Niciun eveniment de afișat.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {logs.map(log => {
                            const cfg = levelConfig[log.level] || levelConfig.info;
                            const Icon = cfg.icon;
                            return (
                                <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 transition">
                                    <div className={`mt-0.5 p-1.5 rounded-lg border ${cfg.bg}`}>
                                        <Icon size={14} className={cfg.color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-medium text-gray-800 text-sm">{log.action}</span>
                                            <span className="text-xs text-gray-400 font-mono">{log.source}</span>
                                        </div>
                                        {log.details && (
                                            <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">{log.details}</p>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400 shrink-0">{timeAgo(log.createdAt)}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex justify-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                        className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                        ← Anterior
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-500">{page} / {pages}</span>
                    <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
                        className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                        Următor →
                    </button>
                </div>
            )}
        </div>
    );
}
