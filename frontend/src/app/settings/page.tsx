'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    ChevronRight, ChevronDown, Key, Store, Truck, FileText, Warehouse,
    Puzzle, RefreshCw, AlertCircle, CheckCircle2, Package, ShoppingCart,
    Zap, Settings as SettingsIcon, Database, ListFilter, ShieldCheck,
    Terminal, ExternalLink, Activity, Download, Upload, Trash2, Cpu
} from 'lucide-react';

interface ConfigField { key: string; label: string; type: string; required: boolean }
interface Plugin {
    name: string; version: string; description: string; author?: string;
    category: string; isActive: boolean; hasCredentials: boolean;
    capabilities: string[];
    configFields: ConfigField[];
}
interface CategoryGroup {
    category: string;
    plugins: Plugin[];
}

const iconMap: Record<string, any> = {
    marketplace: Store, facturare: FileText, curierat: Truck, depozit: Warehouse,
};
const colorMap: Record<string, string> = {
    marketplace: 'text-blue-600 bg-blue-50 border-blue-100',
    facturare: 'text-purple-600 bg-purple-50 border-purple-100',
    curierat: 'text-orange-600 bg-orange-50 border-orange-100',
    depozit: 'text-green-600 bg-green-50 border-green-100',
};
const getIcon = (cat: string) => iconMap[cat.toLowerCase()] || Puzzle;
const getColor = (cat: string) => colorMap[cat.toLowerCase()] || 'text-slate-600 bg-slate-100 border-slate-200';
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const API = process.env.NEXT_PUBLIC_API_URL || '';

const FALLBACK_GROUPS: CategoryGroup[] = [{
    category: 'marketplace',
    plugins: [{
        name: 'emag-connector', version: '1.1.0', category: 'marketplace',
        isActive: false, hasCredentials: false,
        capabilities: ['getOrders', 'pushProduct', 'updateStock'],
        description: 'Conectare cu eMAG Marketplace.',
        configFields: [
            { key: 'username', label: 'Username eMAG', type: 'string', required: true },
            { key: 'password', label: 'Parola API eMAG', type: 'password', required: true },
        ],
    }],
}];

const capabilityLabel: Record<string, { label: string; icon: any; color: string }> = {
    getOrders: { label: 'Import Comenzi', icon: ShoppingCart, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    pushProduct: { label: 'Push Produse', icon: Package, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    updateStock: { label: 'Sync Stoc', icon: Zap, color: 'bg-green-50 text-green-600 border-green-100' },
    onOrderUpdated: { label: 'Status Flux', icon: RefreshCw, color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
    emitInvoice: { label: 'Emitere Factura', icon: FileText, color: 'bg-purple-50 text-purple-600 border-purple-100' },
    generateAWB: { label: 'Generare AWB', icon: Truck, color: 'bg-orange-50 text-orange-600 border-orange-100' },
    trackShipment: { label: 'Tracking', icon: Truck, color: 'bg-slate-50 text-slate-600 border-slate-200' },
};

function CapabilityBadges({ capabilities }: { capabilities: string[] }) {
    if (!capabilities?.length) return null;
    return (
        <div className="flex flex-wrap gap-1.5 mt-3">
            {capabilities.map(cap => {
                const meta = capabilityLabel[cap];
                if (!meta) return null;
                const Icon = meta.icon;
                return (
                    <span key={cap} className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${meta.color}`}>
                        <Icon size={10} />{meta.label}
                    </span>
                );
            })}
        </div>
    );
}

function PluginCard({
    plugin, onToggle, onSaveSettings, onSyncOrders,
}: {
    plugin: Plugin;
    onToggle: (name: string, isActive: boolean) => Promise<void>;
    onSaveSettings: (name: string, settings: Record<string, string>) => Promise<void>;
    onSyncOrders: (name: string) => Promise<void>;
}) {
    const [expanded, setExpanded] = useState(false);
    const [fields, setFields] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

    const showToast = (ok: boolean, msg: string) => {
        setToast({ ok, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setSaving(true);
        try { await onSaveSettings(plugin.name, fields); showToast(true, 'Configurație salvată'); }
        catch { showToast(false, 'Eroare la salvare'); }
        finally { setSaving(false); }
    };

    const handleSync = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setSyncing(true);
        try { await onSyncOrders(plugin.name); showToast(true, 'Sincronizare activată'); }
        catch { showToast(false, 'Eroare sincronizare'); }
        finally { setSyncing(false); }
    };

    const hasGetOrders = plugin.capabilities?.includes('getOrders');

    return (
        <div className={`os-card transition-all duration-300 group overflow-hidden ${plugin.isActive ? 'border-blue-200 ring-2 ring-blue-500/5' : 'border-slate-100 opacity-80'}`}>
            <div
                className="flex items-center justify-between p-5 gap-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => setExpanded(e => !e)}
            >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 ${plugin.isActive ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-500/20 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                        <Cpu size={24} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-black text-slate-900 text-base">{capitalize(plugin.name.replace('-connector', ''))}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black tracking-widest uppercase">v{plugin.version}</span>
                            {plugin.isActive && !plugin.hasCredentials && (
                                <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-lg border border-rose-100 font-black uppercase tracking-widest flex items-center gap-1">
                                    <AlertCircle size={10} /> Configurație Incompletă
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 text-xs font-medium max-w-lg">{plugin.description}</p>
                        <CapabilityBadges capabilities={plugin.capabilities} />
                    </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    <div className="flex flex-col items-end mr-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${plugin.isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                            {plugin.isActive ? 'Sistem Active' : 'Sistem Inactive'}
                        </span>
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggle(plugin.name, !plugin.isActive); }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${plugin.isActive ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xl transition-transform duration-300 ${plugin.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <div className={`transform transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={20} className="text-slate-300" />
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-100 p-6 bg-slate-50/30 animate-in slide-in-from-top-4 duration-500">
                    {plugin.configFields.length > 0 ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                        <Key size={14} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Configurație Securizată API</span>
                                </div>
                                {hasGetOrders && plugin.isActive && (
                                    <button
                                        onClick={handleSync}
                                        disabled={syncing}
                                        className="btn-secondary !py-1.5 !px-3 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                                        Forțează Sincronizarea
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {plugin.configFields.map(f => (
                                    <div key={f.key} className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            {f.label} {f.required && <span className="text-rose-500">*</span>}
                                        </label>
                                        <input
                                            type={f.type === 'password' ? 'password' : f.type === 'boolean' ? 'checkbox' : 'text'}
                                            placeholder={f.type !== 'boolean' ? `Valor: ${f.label}` : undefined}
                                            value={fields[f.key] || ''}
                                            onChange={e => setFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                                            className="os-input !py-2 !text-sm"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn-primary !py-2 !px-6 font-black text-[10px] uppercase tracking-widest"
                                >
                                    {saving ? 'Se salvează...' : 'Activează Configurația'}
                                </button>
                                {toast && (
                                    <span className={`text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-300 ${toast.ok ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {toast.msg}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-slate-400 py-4">
                            <Puzzle size={20} />
                            <p className="text-xs font-bold uppercase tracking-widest">Acest plugin nu necesită configurare manuală.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function IntegrationsTab() {
    const [groups, setGroups] = useState<CategoryGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [offline, setOffline] = useState(false);
    const [syncingAll, setSyncingAll] = useState(false);
    const [syncAllResult, setSyncAllResult] = useState<string | null>(null);

    const fetchPlugins = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/plugins`, { credentials: 'include' });
            if (!res.ok) throw new Error('Not OK');
            const data: CategoryGroup[] = await res.json();
            setGroups(data);
            setOffline(false);
        } catch (err: any) {
            setGroups(FALLBACK_GROUPS);
            setOffline(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPlugins(); }, [fetchPlugins]);

    const handleSyncAll = async () => {
        setSyncingAll(true);
        setSyncAllResult(null);
        try {
            const res = await fetch(`${API}/api/plugins/sync-all-orders`, { method: 'POST', credentials: 'include' });
            const data = await res.json();
            const synced = data.pluginsSynced || [];
            setSyncAllResult(synced.length > 0 ? `Sincronizare completă: ${synced.join(', ')}` : 'Nicio acțiune necesară.');
        } catch {
            setSyncAllResult('Eroare globală la sincronizare.');
        } finally {
            setSyncingAll(false);
            setTimeout(() => setSyncAllResult(null), 4000);
        }
    };

    const handleToggle = async (name: string, isActive: boolean) => {
        setGroups(prev => prev.map(g => ({
            ...g,
            plugins: g.plugins.map(p => p.name === name ? { ...p, isActive } : p),
        })));
        await fetch(`${API}/api/plugins/${name}/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive }),
            credentials: 'include'
        });
    };

    const handleSaveSettings = async (name: string, settings: Record<string, string>) => {
        await fetch(`${API}/api/plugins/${name}/settings`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings }),
        });
        await fetchPlugins();
    };

    const handleSyncOrders = async (name: string) => {
        await fetch(`${API}/api/plugins/${name}/sync-orders`, { method: 'POST', credentials: 'include' });
    };

    return (
        <div className="max-w-4xl space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Connectors Hub</p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Marketplace Tools</h1>
                    <p className="text-slate-500 font-medium font-mono text-sm">
                        {loading ? 'Se analizează plugin-urile...' : `${groups.flatMap(g => g.plugins).filter(p => p.isActive).length} servicii active detectate`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleSyncAll} disabled={syncingAll} className="btn-primary !px-6 flex items-center gap-2">
                        <RefreshCw size={18} className={syncingAll ? 'animate-spin' : ''} />
                        <span>Sincronizează Tot</span>
                    </button>
                    <button onClick={fetchPlugins} className="btn-secondary p-2.5">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {groups.map(group => {
                    const Icon = getIcon(group.category);
                    const color = getColor(group.category);
                    return (
                        <div key={group.category} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest shadow-sm ${color}`}>
                                    <Icon size={14} /> {group.category}
                                </span>
                                <div className="h-[1px] flex-1 bg-slate-100"></div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {group.plugins.map(p => (
                                    <PluginCard
                                        key={p.name} plugin={p}
                                        onToggle={handleToggle}
                                        onSaveSettings={handleSaveSettings}
                                        onSyncOrders={handleSyncOrders}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="os-card p-6 !bg-slate-900 !text-white border-white/10 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-blue-400">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h2 className="font-black tracking-tight text-xl uppercase">Developer API Access</h2>
                        <p className="text-slate-400 text-sm font-medium">Integrează OpenSales cu alte unelte folosind SDK-ul nostru.</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full font-mono text-blue-300 bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-sm truncate">
                        os_live_************************3D2F
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                            <button className="text-white hover:text-blue-400 transition-colors p-1"><ExternalLink size={16} /></button>
                        </div>
                    </div>
                    <button className="btn-primary !bg-white !text-slate-900 border-white hover:!bg-slate-100 whitespace-nowrap !px-8 font-black uppercase tracking-widest text-[10px]">
                        Generează Key
                    </button>
                </div>
            </div>
        </div>
    );
}

function DataOpsTab() {
    return (
        <div className="max-w-4xl space-y-10">
            <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Database Operations</p>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestiune Date & Export</h1>
                <p className="text-slate-500 font-medium text-sm">Transfer massiv de informații între platforme și sistem local.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="os-card p-8 flex flex-col justify-between group hover:border-emerald-200 transition-colors">
                    <div className="space-y-4">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                            <Download size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Export Catalog Complet</h2>
                            <p className="text-slate-500 text-sm mt-1 font-medium leading-relaxed">Generați un fișier CSV cu toate produsele, prețurile și statusul stocului actualizat la minut.</p>
                        </div>
                    </div>
                    <button onClick={() => window.open(`${API}/api/export/products`, '_blank')} className="btn-secondary mt-8 font-black uppercase tracking-widest text-[10px] w-full py-3">
                        Descarcă Produse (.CSV)
                    </button>
                </div>

                <div className="os-card p-8 flex flex-col justify-between group hover:border-blue-200 transition-colors">
                    <div className="space-y-4">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                            <Upload size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Import Produse Master</h2>
                            <p className="text-slate-500 text-sm mt-1 font-medium leading-relaxed">Încărcați liste noi de SKUs dintr-un export ERP sau fișier furnizor. OpenSales va face maparea automată.</p>
                        </div>
                    </div>
                    <label className="btn-secondary mt-8 font-black uppercase tracking-widest text-[10px] w-full py-3 text-center cursor-pointer">
                        Încarcă Fișier Catalog
                        <input type="file" accept=".csv" className="hidden" />
                    </label>
                </div>
            </div>

            <div className="os-card p-8 border-slate-200 bg-slate-50/50">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400">
                        <Activity size={40} />
                    </div>
                    <div className="flex-1 space-y-4">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mentenanță Sistem</h2>
                        <p className="text-slate-600 text-sm font-medium leading-relaxed">
                            Funcții avansate pentru resetarea sincronizărilor sau recalcularea mapărilor între marketplace-uri. Aceste acțiuni pot afecta datele live.
                        </p>
                        <div className="flex gap-4">
                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-colors">Șterge Toate Mapările</button>
                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Recalculează Stocuri</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActivityLogTab() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/api/activity?limit=100`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => setLogs(d.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-6xl space-y-8">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Security Audit</p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Activity Log</h1>
                    <p className="text-slate-500 font-medium text-sm">Cronologia vizibilă a acțiunilor de sistem și utilizator.</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl text-slate-400">
                    <Terminal size={24} />
                </div>
            </div>

            <div className="os-card overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                        Se încarcă log-urile sistemului...
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-24 text-center space-y-4 text-slate-300">
                        <Activity size={48} className="mx-auto" />
                        <p className="font-black uppercase tracking-widest text-xs">Nicio activitate înregistrată</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Status / Nivel</th>
                                    <th className="px-6 py-4">Timp Event</th>
                                    <th className="px-6 py-4">Sursă Sistem</th>
                                    <th className="px-6 py-4">Eveniment Detaliat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60">
                                {logs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border
                                                ${log.level === 'error' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                    log.level === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        log.level === 'warn' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                            'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                                {log.level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-900">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(log.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">{log.source}</span>
                                        </td>
                                        <td className="px-6 py-4 max-w-md">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-900 tracking-tight">{log.action}</span>
                                                <span className="text-[10px] font-medium text-slate-500 line-clamp-1 opacity-70 group-hover:opacity-100 transition-opacity" title={log.details}>
                                                    {log.details || '—'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'integrations' | 'dataOps' | 'activityLog'>('integrations');

    const tabs = [
        { id: 'integrations', label: 'Integrare API', icon: Puzzle },
        { id: 'dataOps', label: 'Data Operations', icon: Database },
        { id: 'activityLog', label: 'Audit & Logs', icon: ListFilter },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="border-b border-slate-100">
                <nav className="-mb-px flex space-x-12">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`group relative py-6 flex items-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Icon size={16} className={`${isActive ? 'text-blue-500' : 'text-slate-300 group-hover:text-slate-400'} transition-colors`} />
                                {tab.label}
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-[0_-4px_12px_rgba(37,99,235,0.4)]" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === 'integrations' && <IntegrationsTab />}
                {activeTab === 'dataOps' && <DataOpsTab />}
                {activeTab === 'activityLog' && <ActivityLogTab />}
            </div>
        </div>
    );
}
