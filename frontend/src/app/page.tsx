'use client';

import { useEffect, useState } from 'react';
import {
  FileText, Box, TrendingUp, AlertCircle, ShoppingCart,
  BarChart2, ArrowUpRight, ArrowDownRight, Package, Clock, Users
} from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DashboardStats {
  kpis: {
    newOrdersToday: number;
    totalProducts: number;
    lowStockProducts: number;
    syncedMappings: number;
    totalOrders: number;
  };
  statusBreakdown: Record<string, number>;
  recentOrders: any[];
  revenue7d: Array<{ date: string; total: number; count: number }>;
}

const sourceColors: Record<string, string> = {
  'emag-connector': 'text-red-600 bg-red-50 border-red-100',
  'trendyol-connector': 'text-orange-600 bg-orange-50 border-orange-100',
  'manual': 'text-slate-600 bg-slate-50 border-slate-100',
};

const statusConfig: Record<string, { label: string, color: string }> = {
  'NEW': { label: 'Nouă', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  'PROCESSING': { label: 'În Lucru', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  'SHIPPED': { label: 'Expediat', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  'DELIVERED': { label: 'Livrat', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  'CANCELLED': { label: 'Anulat', color: 'bg-rose-50 text-rose-700 border-rose-100' },
};

function formatPluginName(name?: string): string {
  if (!name) return 'Manual';
  const labels: Record<string, string> = {
    'emag-connector': 'eMAG',
    'trendyol-connector': 'Trendyol',
  };
  return labels[name] || name;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'acum';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}z`;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/dashboard/stats`, { credentials: 'include' })
      .then(r => r.json())
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded-full w-24"></div>
            <div className="h-10 bg-slate-200 rounded-xl w-64"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const kpis = stats ? [
    { label: 'Comenzi Noi Aujourd\'hui', value: stats.kpis.newOrdersToday, sub: '+12% față de ieri', color: 'text-blue-600', bg: 'bg-blue-600/10', icon: ShoppingCart, trend: 'up' },
    { label: 'Produse Listate', value: stats.kpis.totalProducts, sub: 'În stoc activ', color: 'text-indigo-600', bg: 'bg-indigo-600/10', icon: Box, trend: 'neutral' },
    { label: 'Sincronizări Active', value: stats.kpis.syncedMappings, sub: 'Marketplace-uri live', color: 'text-emerald-600', bg: 'bg-emerald-600/10', icon: TrendingUp, trend: 'up' },
  ] : [];

  const recentOrders = stats?.recentOrders || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Prezentare Generală</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Salut, Admin 👋</h1>
          <p className="text-slate-500 font-medium">Iată noutățile pentru business-ul tău în ultimele 24 de ore.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary">
            <FileText size={18} className="mr-2" />
            <span>Export PDF</span>
          </button>
          <button className="btn-primary">
            <Package size={18} className="mr-2" />
            <span>Adaugă Produs</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className="os-card p-6 flex flex-col justify-between group">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform duration-300`}>
                <kpi.icon size={24} />
              </div>
              {kpi.trend !== 'neutral' && (
                <div className={`flex items-center text-xs font-bold ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {kpi.trend === 'up' ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                  {kpi.sub.split(' ')[0]}
                </div>
              )}
            </div>
            <div className="mt-5 space-y-1">
              <p className="text-2xl font-black text-slate-900 tracking-tight">{kpi.value.toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-500">{kpi.label}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Visualization Card */}
        <div className="lg:col-span-2 os-card p-8 bg-slate-900 text-white border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>

          <div className="relative z-10 flex flex-col h-full space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white/90">Performanță Vânzări</h3>
                <p className="text-sm text-slate-400 font-medium">Evoluția veniturilor în ultimele 7 zile</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-xs font-bold text-white/80">Total Săptămânal</span>
              </div>
            </div>

            <div className="flex-1 flex items-end justify-between gap-3 h-48 pt-4">
              {stats?.revenue7d?.map((day, i) => {
                const maxTotal = Math.max(...stats.revenue7d.map(d => d.total), 1);
                const height = Math.max((day.total / maxTotal) * 100, 4);
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center group space-y-3">
                    <div className="hidden group-hover:block absolute top-[25%] px-2 py-1 bg-white text-slate-900 text-[10px] font-bold rounded shadow-xl animate-in zoom-in-50">
                      {Math.round(day.total).toLocaleString()} RON
                    </div>
                    <div className="w-full flex justify-center items-end h-32 relative">
                      <div
                        className="w-full max-w-[40px] bg-gradient-to-t from-blue-700 to-blue-400 rounded-t-lg transition-all duration-500 group-hover:to-blue-300 group-hover:shadow-[0_0_20px_0_rgba(59,130,246,0.3)]"
                        style={{ height: `${height}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">
                      {new Date(day.date).toLocaleDateString('ro-RO', { weekday: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="os-card p-8 flex flex-col space-y-6">
          <h3 className="text-lg font-bold text-slate-900 px-1 border-l-4 border-blue-600 ml-[-8px]">Status Comenzi</h3>
          <div className="space-y-4 flex-1">
            {Object.entries(stats?.statusBreakdown || {}).map(([status, count]) => {
              const config = statusConfig[status] || { label: status, color: 'bg-slate-100 text-slate-600' };
              const total = Object.values(stats?.statusBreakdown || {}).reduce((a, b) => a + b, 0);
              const percentage = Math.round((count / (total || 1)) * 100);

              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-widest text-[9px] ${config.color}`}>{config.label}</span>
                    <span className="font-black text-slate-900">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${config.color.split(' ')[0]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          <Link href="/orders" className="btn-secondary w-full py-3">
            Gestionează Flux
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="os-card overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-blue-600">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="font-black text-slate-900 tracking-tight">Comenzi Recente</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ultimele actualizări</p>
            </div>
          </div>
          <Link href="/orders" className="btn-secondary px-4 py-2 text-xs font-bold bg-white">
            Vezi Tot
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Box size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-slate-400">Nicio comandă detectată</p>
                <p className="text-sm text-slate-400">Activează integrările pentru a începe sincronizarea.</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4">ID / Referință</th>
                  <th className="px-8 py-4">Sursă Marketplace</th>
                  <th className="px-8 py-4">Status Operational</th>
                  <th className="px-8 py-4 text-right">Valoare Totală</th>
                  <th className="px-8 py-4 text-right">Timp elapsed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {recentOrders.map((order: any) => {
                  const config = statusConfig[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-600' };
                  return (
                    <tr key={order.id} className="group hover:bg-slate-50/80 transition-all duration-200">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">#{order.orderNumber}</span>
                          <span className="text-[10px] font-bold text-slate-400">UID: {order.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider border transition-colors ${sourceColors[order.sourcePlugin] || 'text-slate-500 bg-slate-50 border-slate-100'}`}>
                          {formatPluginName(order.sourcePlugin)}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${config.color}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-2 ${config.color.split(' ')[0].replace('bg-', 'bg-opacity-100 bg-')}`} />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-slate-900">
                        {Number(order.total).toLocaleString('ro-RO')} <span className="text-[10px] font-bold text-slate-400 ml-0.5">RON</span>
                      </td>
                      <td className="px-8 py-5 text-right text-slate-500 font-bold text-xs">
                        {timeAgo(order.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
