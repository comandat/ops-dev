'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, DollarSign, Percent, ToggleLeft } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface PricingRule {
    id: string;
    pluginName: string;
    type: string;
    value: number;
    label?: string;
    createdAt: string;
}

interface OfferTemplate {
    id: string;
    name: string;
    pluginName: string;
    titleTemplate?: string;
    descriptionTemplate?: string;
    externalCategory?: string;
}

const RULE_TYPES = [
    { value: 'PERCENTAGE_ABOVE', label: '% peste baza', icon: Percent, hint: 'Prețul = baza + X%' },
    { value: 'FIXED_ABOVE', label: 'RON peste baza', icon: DollarSign, hint: 'Prețul = baza + X RON' },
    { value: 'FIXED_PRICE', label: 'Preț fix', icon: ToggleLeft, hint: 'Prețul = X RON (indiferent de baza)' },
];

const PLUGIN_LABELS: Record<string, string> = {
    '*': 'Toate Marketplace-urile',
    'emag-connector': 'eMAG',
    'trendyol-connector': 'Trendyol',
};

export default function PricingPage() {
    const [rules, setRules] = useState<PricingRule[]>([]);
    const [templates, setTemplates] = useState<OfferTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    // New rule form state
    const [newRule, setNewRule] = useState({ pluginName: '*', type: 'PERCENTAGE_ABOVE', value: '10', label: '' });
    const [saving, setSaving] = useState(false);

    // New template form state
    const [newTemplate, setNewTemplate] = useState({ name: '', pluginName: 'emag-connector', titleTemplate: '{name}', descriptionTemplate: '', externalCategory: '' });
    const [savingTemplate, setSavingTemplate] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const [rulesRes, tplRes] = await Promise.all([
            fetch(`${API}/api/pricing-rules`, { credentials: 'include' }),
            fetch(`${API}/api/offer-templates`, { credentials: 'include' }),
        ]);
        if (rulesRes.ok) setRules(await rulesRes.json());
        if (tplRes.ok) setTemplates(await tplRes.json());
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const createRule = async () => {
        setSaving(true);
        try {
            await fetch(`${API}/api/pricing-rules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newRule, value: parseFloat(newRule.value) }),
            });
            setNewRule({ pluginName: '*', type: 'PERCENTAGE_ABOVE', value: '10', label: '' });
            fetchData();
        } finally { setSaving(false); }
    };

    const deleteRule = async (id: string) => {
        await fetch(`${API}/api/pricing-rules/${id}`, { method: 'DELETE', credentials: 'include' });
        fetchData();
    };

    const createTemplate = async () => {
        setSavingTemplate(true);
        try {
            await fetch(`${API}/api/offer-templates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newTemplate),
            });
            setNewTemplate({ name: '', pluginName: 'emag-connector', titleTemplate: '{name}', descriptionTemplate: '', externalCategory: '' });
            fetchData();
        } finally { setSavingTemplate(false); }
    };

    const deleteTemplate = async (id: string) => {
        await fetch(`${API}/api/offer-templates/${id}`, { method: 'DELETE', credentials: 'include' });
        fetchData();
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Prețuri & Șabloane</h2>
                <p className="text-gray-500 mt-1">Configurează reguli de preț automate și șabloane de ofertă per marketplace.</p>
            </div>

            {/* ── Pricing Rules ─────────────────────────────────────────────── */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Reguli de Preț</h3>
                <p className="text-sm text-gray-500">Când o ofertă nu are un preț manual setat, aceste reguli se aplică automat la prețul de baza al produsului.</p>

                {/* Add Rule Form */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h4 className="text-sm font-bold text-gray-600 mb-4">Adaugă Regulă Nouă</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Marketplace</label>
                            <select value={newRule.pluginName} onChange={e => setNewRule(r => ({ ...r, pluginName: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                {Object.entries(PLUGIN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Tip</label>
                            <select value={newRule.type} onChange={e => setNewRule(r => ({ ...r, type: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                {RULE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Valoare</label>
                            <input type="number" min="0" step="0.01" value={newRule.value}
                                onChange={e => setNewRule(r => ({ ...r, value: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Etichetă (opțional)</label>
                            <input type="text" placeholder="ex: Marjă eMAG" value={newRule.label}
                                onChange={e => setNewRule(r => ({ ...r, label: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button onClick={createRule} disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            Adaugă Regulă
                        </button>
                    </div>
                </div>

                {/* Rules Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
                    ) : rules.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 text-sm">Nicio regulă configurată. Ofertele vor folosi prețul de baza.</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left">Etichetă</th>
                                    <th className="px-6 py-3 text-left">Marketplace</th>
                                    <th className="px-6 py-3 text-left">Tip</th>
                                    <th className="px-6 py-3 text-right">Valoare</th>
                                    <th className="px-6 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rules.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-gray-700 font-medium">{r.label || '—'}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{PLUGIN_LABELS[r.pluginName] || r.pluginName}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{r.type}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                            {r.type === 'PERCENTAGE_ABOVE' ? `+${r.value}%` : r.type === 'FIXED_ABOVE' ? `+${r.value} RON` : `${r.value} RON (fix)`}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => deleteRule(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {/* ── Offer Templates ───────────────────────────────────────────── */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Șabloane de Ofertă</h3>
                <p className="text-sm text-gray-500">Folosește <code className="bg-gray-100 px-1 rounded">{'{' + 'name}'}</code> și <code className="bg-gray-100 px-1 rounded">{'{' + 'sku}'}</code> ca variabile în titlu/descriere.</p>

                {/* Add template form */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h4 className="text-sm font-bold text-gray-600 mb-4">Adaugă Șablon Nou</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Nume Șablon</label>
                            <input type="text" placeholder="ex: Standard eMAG" value={newTemplate.name}
                                onChange={e => setNewTemplate(t => ({ ...t, name: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Marketplace</label>
                            <select value={newTemplate.pluginName} onChange={e => setNewTemplate(t => ({ ...t, pluginName: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                <option value="emag-connector">eMAG</option>
                                <option value="trendyol-connector">Trendyol</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Șablon Titlu</label>
                            <input type="text" placeholder="{name} — Calitate Premium" value={newTemplate.titleTemplate}
                                onChange={e => setNewTemplate(t => ({ ...t, titleTemplate: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Categorie Externă</label>
                            <input type="text" placeholder="ex: Electronics/Phones" value={newTemplate.externalCategory}
                                onChange={e => setNewTemplate(t => ({ ...t, externalCategory: e.target.value }))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button onClick={createTemplate} disabled={savingTemplate || !newTemplate.name}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
                            {savingTemplate ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            Adaugă Șablon
                        </button>
                    </div>
                </div>

                {/* Templates Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 space-y-3">{[1, 2].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
                    ) : templates.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 text-sm">Niciun șablon creat. Adaugă unul pentru creare rapidă de oferte.</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left">Nume</th>
                                    <th className="px-6 py-3 text-left">Marketplace</th>
                                    <th className="px-6 py-3 text-left">Titlu Șablon</th>
                                    <th className="px-6 py-3 text-left">Categorie</th>
                                    <th className="px-6 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {templates.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">{t.name}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{PLUGIN_LABELS[t.pluginName] || t.pluginName}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm font-mono">{t.titleTemplate || '—'}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{t.externalCategory || '—'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => deleteTemplate(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </div>
    );
}
