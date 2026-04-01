'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Package, Globe, ToggleLeft, ToggleRight,
    Plus, AlertCircle, CheckCircle, Clock, Loader2, Unlink, Link2, Save
} from 'lucide-react';
import ImageGallery from '@/components/ImageGallery';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Product {
    id: string; sku: string; name: string; description?: string;
    price: number; stock: number; images?: string;
    offers?: Offer[];
}

interface Offer {
    id: string; pluginName: string; externalId?: string;
    title?: string; description?: string; images?: string; price?: number;
    isLinked: boolean; isActive: boolean; status: string;
    lastSyncError?: string; lastSyncAt?: string;
}

const pluginLabels: Record<string, string> = {
    'emag-connector': 'eMAG',
    'trendyol-connector': 'Trendyol',
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock },
    SYNCED: { label: 'Sincronizat', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
    PENDING: { label: 'În așteptare', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Loader2 },
    ERROR: { label: 'Eroare', color: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle },
    INACTIVE: { label: 'Inactiv', color: 'bg-gray-50 text-gray-500 border-gray-200', icon: ToggleLeft },
};

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'general' | 'offers'>('offers');
    const [addingOffer, setAddingOffer] = useState(false);
    const [newOfferPlugin, setNewOfferPlugin] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, offerRes] = await Promise.all([
                fetch(`${API}/api/products/${productId}`, { credentials: 'include' }),
                fetch(`${API}/api/products/${productId}/offers`, { credentials: 'include' }),
            ]);
            if (prodRes.ok) {
                const data = await prodRes.json();
                setProduct(data);
                // Initialize local state for editing
                setEditName(data.name);
                setEditDesc(data.description || '');
                setEditImages(data.images ? JSON.parse(data.images) : []);
            }
            if (offerRes.ok) setOffers(await offerRes.json());
        } finally {
            setLoading(false);
        }
    };

    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editImages, setEditImages] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const handleSaveGeneral = async () => {
        setSaving(true);
        try {
            await fetch(`${API}/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: editName,
                    description: editDesc,
                    images: JSON.stringify(editImages)
                }),
            });
            fetchData();
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => { fetchData(); }, [productId]);

    const handleToggleActive = async (offer: Offer) => {
        await fetch(`${API}/api/offers/${offer.id}/toggle-active`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ isActive: !offer.isActive }),
        });
        fetchData();
    };

    const handleToggleLinked = async (offer: Offer) => {
        await fetch(`${API}/api/offers/${offer.id}/toggle-linked`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ isLinked: !offer.isLinked }),
        });
        fetchData();
    };

    const handleCreateOffer = async () => {
        if (!newOfferPlugin) return;
        await fetch(`${API}/api/products/${productId}/offers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ pluginName: newOfferPlugin }),
        });
        setAddingOffer(false);
        setNewOfferPlugin('');
        fetchData();
    };

    if (loading) {
        return (
            <div className="max-w-4xl space-y-6">
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="bg-white rounded-xl p-6 space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-20 text-gray-400">
                Produsul nu a fost găsit.
                <br />
                <Link href="/products" className="text-indigo-500 hover:underline mt-2 inline-block">← Înapoi la Produse</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/products" className="flex items-center gap-1 hover:text-gray-800 transition">
                    <ArrowLeft size={16} /> Produse
                </Link>
                <span>/</span>
                <span className="text-gray-800 font-medium">{product.name}</span>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                    <p className="text-gray-400 font-mono text-sm mt-1">SKU: {product.sku}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{Number(product.price).toLocaleString('ro-RO')} RON</div>
                        <div className={`text-sm font-medium ${product.stock === 0 ? 'text-red-500' : product.stock <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {product.stock} buc stoc
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-6">
                    {(['general', 'offers'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${tab === t
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {t === 'general' && '📋 General'}
                            {t === 'offers' && `🌐 Oferte (${offers.length})`}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab: General */}
            {tab === 'general' && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Galerie Imagini</label>
                            <ImageGallery images={editImages} onImagesChange={setEditImages} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nume Produs</label>
                                <input
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">SKU (Read Only)</label>
                                <p className="font-mono text-gray-500 bg-gray-100 px-3 py-2 rounded-lg text-sm">{product.sku}</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descriere</label>
                            <textarea
                                value={editDesc}
                                onChange={e => setEditDesc(e.target.value)}
                                rows={4}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleSaveGeneral}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Salvează Modificările
                            </button>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                        💡 Modificările pe nume, descriere și imagini se vor propaga automat pe toate ofertele conectate (isLinked = activ).
                    </p>
                </div>
            )}

            {/* Tab: Offers */}
            {tab === 'offers' && (
                <div className="space-y-4">
                    {/* Add Offer button */}
                    <div className="flex justify-end">
                        {addingOffer ? (
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                                <Globe size={16} className="text-gray-400" />
                                <select
                                    value={newOfferPlugin}
                                    onChange={e => setNewOfferPlugin(e.target.value)}
                                    className="text-sm border-none outline-none bg-transparent text-gray-700"
                                >
                                    <option value="">Selectează marketplace...</option>
                                    <option value="emag-connector">eMAG</option>
                                    <option value="trendyol-connector">Trendyol</option>
                                </select>
                                <button onClick={handleCreateOffer} disabled={!newOfferPlugin}
                                    className="ml-2 px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition">
                                    Creează
                                </button>
                                <button onClick={() => setAddingOffer(false)} className="text-gray-400 hover:text-gray-600 text-xs">Anulează</button>
                            </div>
                        ) : (
                            <button onClick={() => setAddingOffer(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition shadow-sm">
                                <Plus size={16} /> Adaugă Ofertă
                            </button>
                        )}
                    </div>

                    {offers.length === 0 ? (
                        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
                            <Globe size={40} className="mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">Nicio ofertă pe marketplace-uri</p>
                            <p className="text-sm mt-1">Adaugă o ofertă pentru a publica produsul pe eMAG, Trendyol sau alte marketplace-uri.</p>
                        </div>
                    ) : (
                        offers.map(offer => {
                            const cfg = statusConfig[offer.status] || statusConfig.DRAFT;
                            const StatusIcon = cfg.icon;
                            return (
                                <div key={offer.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition ${!offer.isActive ? 'opacity-60' : ''}`}>
                                    <div className="p-5 flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="font-semibold text-gray-900 text-base">
                                                    {pluginLabels[offer.pluginName] || offer.pluginName}
                                                </h3>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border ${cfg.color}`}>
                                                    <StatusIcon size={11} />
                                                    {cfg.label}
                                                </span>
                                                {offer.externalId && (
                                                    <span className="text-xs text-gray-400 font-mono">ID: {offer.externalId}</span>
                                                )}
                                            </div>

                                            {/* Offer-specific overrides summary */}
                                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                                                <span>
                                                    <span className="font-medium">Titlu:</span>{' '}
                                                    {offer.title
                                                        ? <span className="text-blue-600">{offer.title}</span>
                                                        : <span className="text-gray-400 italic">moștenit ({product.name})</span>}
                                                </span>
                                                <span>
                                                    <span className="font-medium">Preț:</span>{' '}
                                                    {offer.price != null
                                                        ? <span className="text-blue-600">{Number(offer.price).toLocaleString('ro-RO')} RON</span>
                                                        : <span className="text-gray-400 italic">moștenit ({Number(product.price).toLocaleString('ro-RO')} RON)</span>}
                                                </span>
                                            </div>

                                            {offer.lastSyncError && (
                                                <p className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                                    ⚠ {offer.lastSyncError}
                                                </p>
                                            )}
                                        </div>

                                        {/* Controls */}
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            {/* isLinked toggle */}
                                            <button
                                                onClick={() => handleToggleLinked(offer)}
                                                title={offer.isLinked ? 'Ofertă conectată — click pentru a deconecta' : 'Ofertă deconectată — click pentru a conecta'}
                                                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition ${offer.isLinked
                                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                    : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                                                    }`}
                                            >
                                                {offer.isLinked ? <Link2 size={12} /> : <Unlink size={12} />}
                                                {offer.isLinked ? 'Conectat' : 'Deconectat'}
                                            </button>

                                            {/* isActive toggle */}
                                            <button
                                                onClick={() => handleToggleActive(offer)}
                                                title={offer.isActive ? 'Dezactivează pe marketplace' : 'Activează pe marketplace'}
                                                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition ${offer.isActive
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {offer.isActive ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                                                {offer.isActive ? 'Activ' : 'Inactiv'}
                                            </button>

                                            {/* Edit offer link */}
                                            <Link
                                                href={`/products/${productId}/offers/${offer.id}`}
                                                className="text-xs text-indigo-600 hover:underline mt-1"
                                            >
                                                Editează →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
