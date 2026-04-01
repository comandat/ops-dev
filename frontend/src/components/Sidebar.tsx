'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Box, Settings, BarChart2, Activity, LogOut, DollarSign, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NotificationCenter from './NotificationCenter';

const API = process.env.NEXT_PUBLIC_API_URL || '';

const navItems = [
    { href: '/', icon: BarChart2, label: 'Dashboard' },
    { href: '/orders', icon: ShoppingCart, label: 'Comenzi' },
    { href: '/products', icon: Box, label: 'Produse & Stoc' },
    { href: '/activity', icon: Activity, label: 'Activity Log' },
    { href: '/settings/pricing', icon: DollarSign, label: 'Prețuri & Șabloane' },
    { href: '/settings', icon: Settings, label: 'Integrari (Plugins)' },
];

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
            router.push('/login');
            router.refresh();
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    return (
        <aside className="w-[var(--sidebar-width)] glass-sidebar text-slate-300 flex flex-col h-screen fixed top-0 left-0 z-50">
            {/* Logo Section */}
            <div className="h-[var(--nav-height)] px-6 flex items-center justify-between">
                <div className="flex items-center space-x-2.5 group cursor-pointer">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
                        O
                    </div>
                    <div>
                        <span className="text-white text-lg font-bold tracking-tight">Open</span>
                        <span className="text-slate-400 text-lg font-medium">Sales</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-1 h-1 rounded-full bg-success animate-pulse"></div>
                    <NotificationCenter />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                <p className="px-3 mb-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Meniu Principal</p>
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 transition-colors'} />
                                <span>{label}</span>
                            </div>
                            {isActive && <ChevronRight size={14} className="text-blue-200" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Account */}
            <div className="p-4 bg-slate-900/40 border-t border-slate-800/60">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-red-500/10 transition-all duration-200 text-sm font-medium text-slate-400 hover:text-red-400 group"
                >
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                        <LogOut size={16} />
                    </div>
                    <span>Deconectare</span>
                </button>
                <div className="mt-4 flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold text-slate-600 tracking-[0.2em] uppercase">OpenSales Engine</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">v0.2.0</span>
                </div>
            </div>
        </aside>
    );
}
