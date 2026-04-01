'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Package, User, MapPin, Clock, CheckCircle, Truck, XCircle,
    Loader2, Edit3, Save, AlertTriangle, Calendar
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || '';

const STATUS_STEPS = ['NEW', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const STATUS_ICONS: Record<string, any> = {
    NEW: Clock, PROCESSING: Clock, SHIPPED: Truck, DELIVERED: CheckCircle, CANCELLED: XCircle,
};
const STATUS_COLORS: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700 border-blue-200',
    PROCESSING: 'bg-amber-100 text-amber-700 border-amber-200',
    SHIPPED: 'bg-sky-100 text-sky-700 border-sky-200',
    DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);
    const [changingStatus, setChangingStatus] = useState(false);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/orders/${id}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
                setNotes(data.notes || '');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrder(); }, [id]);

    const handleSaveNotes = async () => {
        setSavingNotes(true);
        try {
            await fetch(`${API}/api/orders/${id}/notes`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ notes }),
            });
        } finally {
            setSavingNotes(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        setChangingStatus(true);
        try {
            await fetch(`${API}/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus }),
            });
            fetchOrder();
        } finally {
            setChangingStatus(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
        </div>
    );

    if (!order) return (
        <div className="text-center text-gray-500 py-16">
            <AlertTriangle size={40} className="mx-auto mb-3 text-gray-300" />
            <p>Comanda nu a fost găsită.</p>
        </div>
    );

    const StatusIcon = STATUS_ICONS[order.status] || Clock;
    const currentStepIdx = STATUS_STEPS.indexOf(order.status);
    const isCancelled = order.status === 'CANCELLED';

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/orders" className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <ArrowLeft size={20} className="text-gray-500" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">#{order.orderNumber}</h2>
                    <p className="text-gray-500 text-sm">
                        <Calendar size={13} className="inline mr-1" />
                        {new Date(order.createdAt).toLocaleString('ro-RO')}
                    </p>
                </div>
                <span className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    <StatusIcon size={14} />
                    {order.status}
                </span>
            </div>

            {/* Status Stepper */}
            {!isCancelled && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Progres Comandă</h3>
                    <div className="flex items-center gap-0">
                        {STATUS_STEPS.map((step, i) => {
                            const done = i <= currentStepIdx;
                            const current = i === currentStepIdx;
                            return (
                                <div key={step} className="flex items-center flex-1">
                                    <button
                                        onClick={() => !done && handleStatusChange(step)}
                                        title={`Marchează ca ${step}`}
                                        className={`flex flex-col items-center gap-1.5 group ${!done ? 'cursor-pointer' : 'cursor-default'}`}
                                    >
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${done
                                            ? 'bg-indigo-600 border-indigo-600'
                                            : 'bg-white border-gray-300 group-hover:border-indigo-400'}`}>
                                            {done
                                                ? <CheckCircle size={18} className="text-white" />
                                                : <span className="text-xs font-bold text-gray-400">{i + 1}</span>
                                            }
                                        </div>
                                        <span className={`text-[10px] font-semibold ${current ? 'text-indigo-600' : done ? 'text-gray-700' : 'text-gray-400'}`}>{step}</span>
                                    </button>
                                    {i < STATUS_STEPS.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-2 ${i < currentStepIdx ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {!isCancelled && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => handleStatusChange('CANCELLED')}
                                disabled={changingStatus}
                                className="text-xs text-red-500 hover:text-red-600 font-medium transition"
                            >
                                Marchează ca Anulată
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                            <Package size={16} className="text-indigo-500" />
                            <h3 className="font-semibold text-gray-800">Produse ({order.items?.length || 0})</h3>
                        </div>
                        <table className="w-full">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3 text-left">Produs</th>
                                    <th className="px-6 py-3 text-right">Cantitate</th>
                                    <th className="px-6 py-3 text-right">Preț/buc</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.items?.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{item.productName}</p>
                                            {item.sku && <p className="text-xs text-gray-400 font-mono">{item.sku}</p>}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-700">{item.quantity}</td>
                                        <td className="px-6 py-4 text-right text-gray-700">{Number(item.unitPrice).toLocaleString('ro-RO')} RON</td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                            {(item.unitPrice * item.quantity).toLocaleString('ro-RO')} RON
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-700">TOTAL</td>
                                    <td className="px-6 py-4 text-right font-bold text-lg text-indigo-600">
                                        {Number(order.total).toLocaleString('ro-RO')} RON
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Status History */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Istoric Status</h3>
                        {order.history?.length > 0 ? (
                            <div className="space-y-3">
                                {order.history.map((h: any, i: number) => (
                                    <div key={h.id || i} className="flex items-start gap-3">
                                        <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-400 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[h.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                    {h.status}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(h.createdAt).toLocaleString('ro-RO')}
                                                </span>
                                            </div>
                                            {h.note && <p className="text-xs text-gray-500 mt-0.5 italic">{h.note}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">Nicio înregistrare în istoric.</p>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Customer */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <User size={16} className="text-indigo-500" />
                            <h3 className="font-semibold text-gray-800">Client</h3>
                        </div>
                        {order.customer ? (
                            <div className="space-y-1.5 text-sm">
                                <p className="font-medium text-gray-900">{order.customer.name}</p>
                                <p className="text-gray-500">{order.customer.email}</p>
                                {order.customer.phone && <p className="text-gray-500">{order.customer.phone}</p>}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">Client necunoscut</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Edit3 size={16} className="text-indigo-500" />
                            <h3 className="font-semibold text-gray-800">Note Interne</h3>
                        </div>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={4}
                            placeholder="Adaugă note interne despre această comandă..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <button
                            onClick={handleSaveNotes}
                            disabled={savingNotes}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {savingNotes ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Salvează Note
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
