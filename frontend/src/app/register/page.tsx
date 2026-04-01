'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, AlertCircle, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { EasySalesMigrationModal } from '../../components/EasySalesMigrationModal';
import { trackRegisterStarted, trackRegisterCompleted } from '@/lib/analytics';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showMigrationModal, setShowMigrationModal] = useState(false);
    const router = useRouter();

    // Track register_started when page loads
    useEffect(() => {
        trackRegisterStarted();
    }, []);

    const sendVerificationCode = async (userEmail: string) => {
        try {
            await fetch(`${API}/api/auth/send-verification-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail }),
            });
        } catch (err) {
            console.error('Failed to send verification code:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password, name }),
            });

            if (res.ok) {
                // Track register_completed
                trackRegisterCompleted();
                // Trimite email de verificare
                await sendVerificationCode(email);
                // Redirect la verify page
                router.push(`/verify?email=${encodeURIComponent(email)}`);
            } else {
                const data = await res.json();
                setError(data.message || 'Eroare la înregistrare');
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
                <div className="absolute inset-0 z-0 text-slate-800 opacity-20 transition-transform duration-[10s] hover:scale-110">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/40 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/30 blur-[120px] rounded-full"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg space-y-10">
                    <div className="space-y-4">
                        <h1 className="text-6xl font-black text-white leading-tight tracking-tight">
                            Începe drumul <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">spre eficiență.</span>
                        </h1>
                        <p className="text-xl text-slate-400 font-medium leading-relaxed">
                            Peste 500 de afaceri folosesc OpenSales pentru a-și scala vânzările în marketplace-uri internaționale.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {[
                            'Instalare rapidă sub 5 minute',
                            'Integrări native cu eMAG, Trendyol, FGO',
                            'Automatizare AWB și Facturare',
                            'Până la 40% reducere în costuri operaționale'
                        ].map((text, i) => (
                            <div key={i} className="flex items-center space-x-3 group">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                                    <CheckCircle2 className="text-blue-400" size={14} />
                                </div>
                                <span className="text-slate-300 font-semibold">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50/30 overflow-y-auto">
                <div className="w-full max-w-md space-y-10 py-10 animate-in fade-in duration-700 slide-in-from-right-4">
                    <div className="space-y-3">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Creează Cont</h2>
                        <p className="text-slate-500 font-medium text-lg italic">Completează profilul de business pentru a începe.</p>
                    </div>

                    {error && (
                        <div className="os-card !bg-red-50/50 !border-red-200 p-4 flex items-start gap-3 text-red-700 text-sm animate-in zoom-in-95">
                            <AlertCircle size={18} className="shrink-0" />
                            <p className="font-semibold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="name" className="text-sm font-bold text-slate-700 ml-1">Nume Complet / Business</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="os-input !pl-12 !bg-white/70"
                                    placeholder="Ex: Ion Popescu sau SRL Company"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
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

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">Parolă Securizată</label>
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
                            <p className="text-[10px] text-slate-400 ml-1 mt-1 italic">Minim 8 caractere, incluzând cifre și simboluri.</p>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-4 text-lg"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>Creează Cont Gratuit</span>
                                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="text-center pt-8 border-t border-slate-200/60">
                        <p className="text-slate-500 font-medium tracking-tight">
                            Ai deja un cont definit?{' '}
                            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-bold decoration-2 underline-offset-4 hover:underline">
                                Autentifică-te aici
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <EasySalesMigrationModal
                isOpen={showMigrationModal}
                onClose={() => {
                    router.push('/');
                    router.refresh();
                }}
                onSuccess={() => {
                    router.push('/');
                    router.refresh();
                }}
            />
        </div>
    );
}
