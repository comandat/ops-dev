'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search, Plus, Download, Upload, Package, ChevronLeft,
    ChevronRight, ExternalLink, CheckCircle, MoreHorizontal,
    Box, AlertCircle, TrendingUp, DollarSign, Layers, Tag as TagIcon,
    Clock
} from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Product {
    id: string;
    sku: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    lowStockThreshold: number;
    images?: string;
    createdAt: string;
    offers?: Array<{ pluginName: string; externalId: string; status: string }>;
}

const pluginLabels: Record<string, string> = {
    'emag-connector': 'eMAG',
    'trendyol-connector': 'Trendyol',
};

const pluginColors: Record<string, string> = {
    'emag-connector': 'text-red-600 bg-red-50 border-red-100',
    'trendyol-connector': 'text-orange-600 bg-orange-50 border-orange-100',
    'manual': 'text-slate-600 bg-slate-50 border-slate-100',
};

const stockConfig = (stock: number, threshold: number) => {
    if (stock === 0) return { label: 'Epuizat', color: 'bg-rose-50 text-rose-700 border-rose-100', icon: AlertCircle };
    if (stock <= threshold) return { label: 'Limitat', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock };
    return { label: 'În Stoc', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle };
};

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [search, setSearch] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const router = useRouter();

    const limit = 12;

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (search) params.set('search', search);
        if (stockFilter) params.set('stockFilter', stockFilter);
        params.set('sortBy', 'createdAt');
        params.set('sortDir', 'desc');

        try {
            const res = await fetch(`${API}/api/products?${params}`, { credentials: 'include' });
            const json = await res.json();
            setProducts(json.data || []);
            setTotal(json.meta?.total || 0);
            setPages(json.meta?.pages || 1);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, stockFilter]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

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
        if (selected.size === products.length && products.length > 0) setSelected(new Set());
        else setSelected(new Set(products.map(p => p.id)));
    };

    const stockFilters = [
        { id: '', label: 'Toate Produsele' },
        { id: 'out_of_stock', label: 'Epuizate' },
        { id: 'low_stock', label: 'Stoc Critic' },
    ];

    const [importMsg, setImportMsg] = useState<string | null>(null);

    const handleExportCSV = () => {
        window.open(`${API}/api/export/products`, '_blank');
    };

    const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch(`${API}/api/import/products`, { method: 'POST', body: formData, credentials: 'include' });
            const data = await res.json();
            setImportMsg(`✅ S-au procesat ${data.created + data.updated} produse. (${data.errors?.length || 0} erori)`);
            fetchProducts();
        } catch {
            setImportMsg('❌ Eroare la procesarea fișierului CSV.');
        } finally {
            e.target.value = '';
            setTimeout(() => setImportMsg(null), 5000);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Master Catalog</p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Catalog Produse</h1>
                    <p className="text-slate-500 font-medium font-mono text-sm">
                        Total {total.toLocaleString()} SKUs • Gata de listare marketplace
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={handleExportCSV} className="btn-secondary">
                        <Download size={18} className="mr-2" />
                        <span>Export</span>
                    </button>
                    <label className="btn-secondary cursor-pointer">
                        <Upload size={18} className="mr-2" />
                        <span>Import CSV</span>
                        <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
                    </label>
                    <button className="btn-primary">
                        <Plus size={18} className="mr-2" />
                        <span>Produs Nou</span>
                    </button>
                </div>
            </div>

            {importMsg && (
                <div className="os-card !bg-emerald-50 !border-emerald-200 p-4 flex items-center gap-3 text-emerald-800 font-bold text-sm animate-in zoom-in-95">
                    <CheckCircle size={20} className="text-emerald-500" />
                    {importMsg}
                </div>
            )}

            {/* Filter Bar */}
            <div className="os-card p-4 flex flex-col xl:flex-row gap-6 items-center">
                <div className="relative w-full xl:w-[450px] group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Caută după Nume, SKU sau Descriere..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        className="os-input !pl-12 !bg-slate-50"
                    />
                </div>

                <div className="flex-1 flex gap-2 flex-wrap items-center">
                    {stockFilters.map(f => (
                        <button
                            key={f.id}
                            onClick={() => { setStockFilter(f.id); setPage(1); }}
                            className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg border transition-all duration-200 ${stockFilter === f.id
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Grid */}
            <div className="os-card overflow-hidden">
                {loading ? (
                    <div className="p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-40 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-24 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 border-4 border-white shadow-inner">
                            <Package size={40} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-slate-400">Inventar Gol</p>
                            <p className="text-sm text-slate-400 max-w-xs mx-auto">Începe prin a importa produsele tale dintr-un fișier CSV sau adaugă primul SKU manual.</p>
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
                                                checked={selected.size === products.length && products.length > 0}
                                                onChange={toggleAll}
                                                className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-8 py-5">Identitate Produs</th>
                                        <th className="px-8 py-5">Preț Vânzare</th>
                                        <th className="px-8 py-5">Stoc Disponibil</th>
                                        <th className="px-8 py-5">Canale Listare</th>
                                        <th className="px-8 py-5 text-right">Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/60">
                                    {products.map(product => {
                                        const config = stockConfig(product.stock, product.lowStockThreshold || 10);
                                        const StockIcon = config.icon;
                                        const isSel = selected.has(product.id);

                                        return (
                                            <tr
                                                key={product.id}
                                                onClick={() => router.push(`/products/${product.id}`)}
                                                className={`group hover:bg-slate-50/80 transition-all duration-200 cursor-pointer ${isSel ? 'bg-blue-50/50' : ''}`}
                                            >
                                                <td className="px-8 py-6" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSel}
                                                        onChange={() => toggleSelect(product.id)}
                                                        className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-300 shadow-sm group-hover:scale-110 transition-transform overflow-hidden relative">
                                                            {(() => {
                                                                if (!product.images) return <Package size={20} />;
                                                                try {
                                                                    const imgs = JSON.parse(product.images);
                                                                    const firstImg = Array.isArray(imgs) ? imgs[0] : imgs;
                                                                    if (firstImg) return <img src={firstImg} alt="" className="w-full h-full object-cover" loading="lazy" />;
                                                                } catch {
                                                                    if (product.images.startsWith('http')) return <img src={product.images} alt="" className="w-full h-full object-cover" loading="lazy" />;
                                                                }
                                                                return <Package size={20} />;
                                                            })()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{product.name}</span>
                                                            <div className="flex items-center mt-0.5 gap-2">
                                                                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 flex items-center">
                                                                    <TagIcon size={10} className="mr-1" />
                                                                    {product.sku}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-slate-400">ID: {product.id.slice(0, 8)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-1 font-black text-slate-900 text-base">
                                                        <DollarSign size={14} className="text-slate-300" />
                                                        {Number(product.price).toLocaleString('ro-RO')}
                                                        <span className="text-[10px] font-bold text-slate-400 ml-1">RON</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center w-24">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-black text-[10px] uppercase border tracking-widest ${config.color}`}>
                                                                <StockIcon size={10} className="mr-1" />
                                                                {product.stock} units
                                                            </span>
                                                        </div>
                                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-1000 ${config.color.split(' ')[0]}`}
                                                                style={{ width: `${Math.min((product.stock / (product.lowStockThreshold * 3 || 30)) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex gap-2 flex-wrap max-w-[200px]">
                                                        {(product.offers || []).map(m => (
                                                            <span key={m.pluginName} className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2 py-1 rounded-lg border shadow-sm ${pluginColors[m.pluginName] || 'bg-slate-50 text-slate-400'}`}>
                                                                {pluginLabels[m.pluginName] || m.pluginName}
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                            </span>
                                                        ))}
                                                        {(!product.offers || product.offers.length === 0) && (
                                                            <span className="text-[10px] font-bold text-slate-300 italic tracking-widest uppercase">Neconectat</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right" onClick={e => e.stopPropagation()}>
                                                    <Link
                                                        href={`/products/${product.id}`}
                                                        className="inline-flex p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Vezi detalii"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </Link>
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
                                <span className="text-slate-900 font-black">{total}</span> SKU-uri mapate
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="btn-secondary !px-4 !py-2 !text-xs !bg-white"
                                >
                                    <ChevronLeft size={16} className="mr-1" />
                                    Prev
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                                    disabled={page >= pages}
                                    className="btn-secondary !px-4 !py-2 !text-xs !bg-white"
                                >
                                    Next
                                    <ChevronRight size={16} className="ml-1" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Premium Bulk Actions Drawer */}
            {selected.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-[100] border border-white/10 backdrop-blur-xl animate-in slide-in-from-bottom-10 duration-500">
                    <div className="flex items-center gap-3 pr-6 border-r border-white/20">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-black text-sm text-white shadow-xl shadow-blue-500/20">
                            {selected.size}
                        </div>
                        <span className="text-sm font-bold tracking-tight">Obiecte Selectate</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-blue-600 rounded-xl flex items-center hover:bg-blue-500 transition-colors">
                            <TrendingUp size={14} className="mr-2" />
                            Sincronizare Multi-Channel
                        </button>
                        <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                            Export Excel
                        </button>
                        <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/30 transition-colors">
                            Elimină
                        </button>
                    </div>
                    <button onClick={() => setSelected(new Set())} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors ml-4">
                        Reset
                    </button>
                </div>
            )}
        </div>
    );
}
