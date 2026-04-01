'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                router.push('/');
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.message || 'Email sau parolă incorectă');
            }
        } catch (err) {
            setError('Eroare de conexiune la server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white overflow-hidden">
            {/* Left Side: Visual / Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/30 blur-[120px] rounded-full animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full scale-150"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg space-y-8">
                    <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-white/80 text-xs font-bold tracking-[0.2em] uppercase">OpenSales Platform v0.2.0</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-6xl font-black text-white leading-tight tracking-tight">
                            Accelerăm <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">vânzările tale.</span>
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed font-medium">
                            Automatizare completă pentru Marketplace, Logistică și Facturare. Management unitar într-o interfață premium.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/10">
                        <div>
                            <p className="text-2xl font-bold text-white">99.9%</p>
                            <p className="text-sm text-slate-500 font-semibold">Uptime Garanțat</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">2k+</p>
                            <p className="text-sm text-slate-500 font-semibold">Comenzi / Minut</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50/30">
                <div className="w-full max-w-md space-y-10 animate-in fade-in duration-700 slide-in-from-right-4">
                    <div className="space-y-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8 lg:hidden">
                            <span className="text-white font-bold text-xl">O</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Contul tău</h2>
                        <p className="text-slate-500 font-medium text-lg">Introduceți datele pentru a accesa dashboard-ul.</p>
                    </div>

                    {error && (
                        <div className="os-card !bg-red-50/50 !border-red-200 p-4 flex items-start gap-3 text-red-700 text-sm animate-in zoom-in-95">
                            <AlertCircle size={18} className="shrink-0" />
                            <p className="font-semibold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email Business</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="os-input !pl-12 !bg-white/70"
                                    placeholder="nume@companie.ro"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label htmlFor="password" className="text-sm font-bold text-slate-700">Parolă Securizată</label>
                                <Link href="#" className="text-xs font-bold text-blue-600 hover:text-blue-500">Ai uitat parola?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="os-input !pl-12 !bg-white/70"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-lg"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Acces Dashboard</span>
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-8 border-t border-slate-200/60">
                        <p className="text-slate-500 font-medium">
                            Nou în platformă?{' '}
                            <Link href="/register" className="text-blue-600 hover:text-blue-500 font-bold decoration-2 underline-offset-4 hover:underline">
                                Creează un cont gratuit
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
