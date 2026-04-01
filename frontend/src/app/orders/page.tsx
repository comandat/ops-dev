'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    Search, Filter, Download, Truck, CheckCircle, Clock,
    ChevronLeft, ChevronRight, MoreHorizontal, User,
    Package, ShoppingBag, AlertCircle, Calendar, Hash
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    sourcePlugin?: string;
    createdAt: string;
    customer?: { name: string; email: string } | null;
    items?: Array<{ productName: string; quantity: number; unitPrice: number }>;
}

const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
    'NEW': { label: 'Nouă', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Clock },
    'PROCESSING': { label: 'În Lucru', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock },
    'SHIPPED': { label: 'Expediat', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: Truck },
    'DELIVERED': { label: 'Livrat', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle },
    'CANCELLED': { label: 'Anulat', color: 'bg-rose-50 text-rose-700 border-rose-100', icon: AlertCircle },
};

function formatPluginName(name?: string): string {
    if (!name) return 'Manual';
    const labels: Record<string, string> = { 'emag-connector': 'eMAG', 'trendyol-connector': 'Trendyol' };
    return labels[name] || name;
}

const sourceBadgeColors: Record<string, string> = {
    'emag-connector': 'text-red-600 bg-red-50 border-red-100',
    'trendyol-connector': 'text-orange-600 bg-orange-50 border-orange-100',
    'manual': 'text-slate-600 bg-slate-50 border-slate-100',
};

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const limit = 12;

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (search) params.set('search', search);
        if (statusFilter) params.set('status', statusFilter);
        params.set('sortBy', 'createdAt');
        params.set('sortDir', 'desc');

        try {
            const res = await fetch(`${API}/api/orders?${params}`, { credentials: 'include' });
            const json = await res.json();
            setOrders(json.data || []);
            setTotal(json.total || 0);
            setPages(json.pages || 1);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // Debounced search
    const [searchInput, setSearchInput] = useState('');
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    const toggleSelect = (id: string) => {
        const next = new Set(selected);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelected(next);
    };

    const toggleAll = () => {
        if (selected.size === orders.length && orders.length > 0) {
            setSelected(new Set());
        } else {
            setSelected(new Set(orders.map(o => o.id)));
        }
    };

    const statuses = [
        { id: '', label: 'Toate' },
        { id: 'NEW', label: 'Noi' },
        { id: 'PROCESSING', label: 'În Lucru' },
        { id: 'SHIPPED', label: 'Expediate' },
        { id: 'DELIVERED', label: 'Livrate' },
        { id: 'CANCELLED', label: 'Anulate' }
    ];

    const handleExportCSV = () => {
        window.open(`${API}/api/export/orders`, '_blank');
    };

    const handleBulkStatus = async (status: string) => {
        if (!selected.size) return;
        await fetch(`${API}/api/orders/batch/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ ids: [...selected], status }),
        });
        setSelected(new Set());
        fetchOrders();
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Order Management</p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Comenzi Clienți</h1>
                    <p className="text-slate-500 font-medium font-mono text-sm">
                        {total.toLocaleString()} total • Sincronizare în timp real activă
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={handleExportCSV} className="btn-secondary">
                        <Download size={18} className="mr-2" />
                        <span>Export CSV</span>
                    </button>
                    <button className="btn-primary">
                        <ShoppingBag size={18} className="mr-2" />
                        <span>Sincronizează Acum</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="os-card p-4 flex flex-col xl:flex-row gap-6 items-center">
                <div className="relative w-full xl:w-[450px] group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Caută nr. comandă, client sau email..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        className="os-input !pl-12 !bg-slate-50"
                    />
                </div>

                <div className="flex-1 flex gap-2 flex-wrap items-center">
                    <div className="flex items-center mr-2 text-slate-400">
                        <Filter size={16} className="mr-2" />
                        <span className="text-xs font-bold uppercase tracking-wider">Status:</span>
                    </div>
                    {statuses.map(s => (
                        <button
                            key={s.id}
                            onClick={() => { setStatusFilter(s.id); setPage(1); }}
                            className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg border transition-all duration-200 ${statusFilter === s.id
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Table */}
            <div className="os-card overflow-hidden">
                {loading ? (
                    <div className="p-12 space-y-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="flex gap-4 items-center">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg animate-pulse" />
                                <div className="flex-1 h-8 bg-slate-50 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="py-24 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                            <ShoppingBag size={40} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-slate-400">Nicio comandă găsită</p>
                            <p className="text-sm text-slate-400 max-w-xs mx-auto">Verifică filtrele de căutare sau asigură-te că integrările sunt active.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5 w-12">
                                            <input
                                                type="checkbox"
                                                checked={selected.size === orders.length && orders.length > 0}
                                                onChange={toggleAll}
                                                className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-8 py-5">Referință / Data</th>
                                        <th className="px-8 py-5">Sursă Marketplace</th>
                                        <th className="px-8 py-5">Client Detalii</th>
                                        <th className="px-8 py-5">Produse / Volum</th>
                                        <th className="px-8 py-5">Status Flux</th>
                                        <th className="px-8 py-5 text-right">Valoare Totală</th>
                                        <th className="px-8 py-5 text-right">Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/60">
                                    {orders.map(order => {
                                        const config = statusConfig[order.status] || { label: order.status, color: 'bg-slate-50 text-slate-600 border-slate-100', icon: Clock };
                                        const StatusIcon = config.icon;
                                        const isSel = selected.has(order.id);

                                        return (
                                            <tr key={order.id} className={`group hover:bg-slate-50/80 transition-all duration-200 cursor-pointer ${isSel ? 'bg-blue-50/50' : ''}`} onClick={() => router.push(`/orders/${order.id}`)}>
                                                <td className="px-8 py-5" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSel}
                                                        onChange={() => toggleSelect(order.id)}
                                                        className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-900 group-hover:text-blue-600 transition-colors flex items-center">
                                                            <Hash size={14} className="mr-1 text-slate-300" />
                                                            {order.orderNumber}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 flex items-center mt-0.5">
                                                            <Calendar size={12} className="mr-1" />
                                                            {new Date(order.createdAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider border transition-colors ${sourceBadgeColors[order.sourcePlugin || 'manual']}`}>
                                                        {formatPluginName(order.sourcePlugin)}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                            {order.customer?.name?.[0] || <User size={14} />}
                                                        </div>
                                                        <div className="flex flex-col max-w-[150px]">
                                                            <span className="font-bold text-slate-700 truncate">{order.customer?.name || 'Nespecificat'}</span>
                                                            <span className="text-[10px] text-slate-400 truncate">{order.customer?.email || 'Fără email'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="font-black text-slate-900">{order.items?.length || 0}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.items?.length === 1 ? 'articol' : 'articole'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${config.color}`}>
                                                        <StatusIcon size={12} className="mr-1.5" />
                                                        {config.label}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-black text-slate-900">{Number(order.total).toLocaleString('ro-RO')}</span>
                                                        <span className="text-[10px] font-bold text-slate-400">RON</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                                                        <MoreHorizontal size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Pagina <span className="text-slate-900">{page}</span> din <span className="text-slate-900">{pages}</span>
                                <span className="mx-2">•</span>
                                <span className="text-slate-900 font-black">{total}</span> comenzi detectate
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="btn-secondary !px-4 !py-2 !text-xs !bg-white disabled:opacity-30"
                                >
                                    <ChevronLeft size={16} className="mr-1" />
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                                    disabled={page >= pages}
                                    className="btn-secondary !px-4 !py-2 !text-xs !bg-white disabled:opacity-30"
                                >
                                    Următor
                                    <ChevronRight size={16} className="ml-1" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Premium Bulk Actions Drawer */}
            {selected.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex flex-wrap items-center gap-6 z-[100] border border-white/10 backdrop-blur-xl animate-in slide-in-from-bottom-10 duration-500">
                    <div className="flex items-center gap-3 pr-6 border-r border-white/20">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-black text-sm text-white shadow-xl shadow-blue-500/20">
                            {selected.size}
                        </div>
                        <span className="text-sm font-bold tracking-tight">Comenzi Selectate</span>
                    </div>

                    <div className="flex gap-2">
                        {['PROCESSING', 'SHIPPED', 'DELIVERED'].map(s => {
                            const config = statusConfig[s];
                            return (
                                <button
                                    key={s}
                                    onClick={() => handleBulkStatus(s)}
                                    className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95"
                                >
                                    {config?.label || s}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => handleBulkStatus('CANCELLED')}
                            className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/20 rounded-xl transition-all active:scale-95"
                        >
                            Anulează
                        </button>
                    </div>

                    <button
                        onClick={() => setSelected(new Set())}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors ml-4"
                    >
                        Resetează
                    </button>
                </div>
            )}
        </div>
    );
}
