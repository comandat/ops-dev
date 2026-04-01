'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, RefreshCw, Link2, Unlink } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || '';

const pluginLabels: Record<string, string> = {
    'emag-connector': 'eMAG',
    'trendyol-connector': 'Trendyol',
};

interface ResolvedOffer {
    id: string; productId: string; pluginName: string; externalId?: string;
    // Effective values (after merge with product)
    title: string; description: string | null; images: string | null; price: number;
    externalCategory: string | null;
    isLinked: boolean; isActive: boolean; status: string;
    lastSyncError: string | null;
    _overrides: { title: string | null; description: string | null; images: string | null; price: number | null };
}

interface FieldRowProps {
    label: string;
    field: string;
    type?: 'text' | 'textarea' | 'number';
    value: string | number | null;
    inherited: boolean;
    inheritedValue: string | number | null;
    onChange: (val: string | null) => void;
}

function FieldRow({ label, field, type = 'text', value, inherited, inheritedValue, onChange }: FieldRowProps) {
    const displayValue = value !== null ? String(value) : '';

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                {inherited ? (
                    <span className="text-xs text-gray-400 italic flex items-center gap-1">
                        <Link2 size={10} /> Moștenit de la produs
                    </span>
                ) : (
                    <button
                        onClick={() => onChange(null)}
                        className="text-xs text-orange-500 hover:text-orange-700 flex items-center gap-1"
                        title="Resetează la valoarea produsului"
                    >
                        <Unlink size={10} /> Resetează la produs
                    </button>
                )}
            </div>

            {type === 'textarea' ? (
                <textarea
                    rows={3}
                    value={displayValue}
                    placeholder={inherited ? String(inheritedValue || '') : ''}
                    onChange={e => onChange(e.target.value || null)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${inherited ? 'border-gray-200 bg-gray-50 text-gray-400 placeholder:text-gray-300' : 'border-blue-300 bg-blue-50/30'
                        }`}
                />
            ) : (
                <input
                    type={type}
                    value={displayValue}
                    placeholder={inherited ? String(inheritedValue ?? '') : ''}
                    onChange={e => onChange(e.target.value || null)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${inherited ? 'border-gray-200 bg-gray-50 text-gray-400 placeholder:text-gray-300' : 'border-blue-300 bg-blue-50/30'
                        }`}
                />
            )}
        </div>
    );
}

export default function OfferEditPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;
    const offerId = params.offerId as string;

    const [offer, setOffer] = useState<ResolvedOffer | null>(null);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Form state (null = inherit from product)
    const [title, setTitle] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const [price, setPrice] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [offerRes, prodRes] = await Promise.all([
                fetch(`${API}/api/offers/${offerId}/resolved`, { credentials: 'include' }),
                fetch(`${API}/api/products/${productId}`, { credentials: 'include' }),
            ]);
            if (offerRes.ok) {
                const data: ResolvedOffer = await offerRes.json();
                setOffer(data);
                // Initialize with override values (null = inherited)
                setTitle(data._overrides.title);
                setDescription(data._overrides.description);
                setPrice(data._overrides.price != null ? String(data._overrides.price) : null);
            }
            if (prodRes.ok) setProduct(await prodRes.json());
            setLoading(false);
        };
        load();
    }, [offerId, productId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`${API}/api/offers/${offerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title: title || null,
                    description: description || null,
                    price: price ? parseFloat(price) : null,
                }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl space-y-6">
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="bg-white rounded-xl p-6 space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
                </div>
            </div>
        );
    }

    if (!offer) {
        return <div className="text-center py-20 text-gray-400">Oferta nu a fost găsită.</div>;
    }

    return (
        <div className="max-w-2xl space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/products" className="hover:text-gray-800 transition">Produse</Link>
                <span>/</span>
                <Link href={`/products/${productId}`} className="hover:text-gray-800 transition">{product?.name || productId}</Link>
                <span>/</span>
                <span className="text-gray-800 font-medium">
                    Ofertă {pluginLabels[offer.pluginName] || offer.pluginName}
                </span>
            </div>

            {/* Status bar */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800 text-lg">
                        {pluginLabels[offer.pluginName] || offer.pluginName}
                    </span>
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${offer.status === 'SYNCED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        offer.status === 'ERROR' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>{offer.status}</span>
                </div>
                <div className="flex gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-lg border ${offer.isLinked ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                        {offer.isLinked ? '🔗 Conectat' : '🔓 Deconectat'}
                    </span>
                    <span className={`px-2 py-1 rounded-lg border ${offer.isActive ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}>
                        {offer.isActive ? '✓ Activ' : '✗ Inactiv'}
                    </span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded border-2 border-gray-200 bg-gray-50 inline-block" />
                    Câmp moștenit de la produs (se actualizează automat dacă Conectat)
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded border-2 border-blue-300 bg-blue-50 inline-block" />
                    Override propriu al ofertei
                </span>
            </div>

            {/* Fields */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
                <FieldRow
                    label="Titlu pe marketplace"
                    field="title"
                    value={title}
                    inherited={title === null}
                    inheritedValue={product?.name ?? ''}
                    onChange={setTitle}
                />
                <FieldRow
                    label="Descriere pe marketplace"
                    field="description"
                    type="textarea"
                    value={description}
                    inherited={description === null}
                    inheritedValue={product?.description ?? 'fără descriere'}
                    onChange={setDescription}
                />
                <FieldRow
                    label="Preț pe marketplace (RON)"
                    field="price"
                    type="number"
                    value={price}
                    inherited={price === null}
                    inheritedValue={product?.price ?? 0}
                    onChange={setPrice}
                />
            </div>

            {/* Error display */}
            {offer.lastSyncError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                    <strong>Ultima eroare de sincronizare:</strong> {offer.lastSyncError}
                </div>
            )}

            {/* Save */}
            <div className="flex justify-end gap-3">
                <Link
                    href={`/products/${productId}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm"
                >
                    Înapoi
                </Link>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-5 py-2 rounded-lg text-sm text-white font-medium transition flex items-center gap-2 ${saved ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'
                        } disabled:opacity-60`}
                >
                    {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    {saved ? 'Salvat!' : saving ? 'Se salvează...' : 'Salvează Modificările'}
                </button>
            </div>
        </div>
    );
}
