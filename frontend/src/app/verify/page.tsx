'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, Mail, RefreshCw, CheckCircle2 } from 'lucide-react';
import { trackEmailVerified } from '@/lib/analytics';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function VerifyPage() {
    const [code, setCode] = useState('');
    const [email, setEmail] = useState('n***@companie.ro');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Countdown timer
    useEffect(() => {
        if (timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle code input - only numeric
    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setCode(value);
        
        // Auto-submit when 6 digits entered
        if (value.length === 6) {
            handleVerify();
        }
    };

    const handleVerify = async () => {
        if (code.length !== 6) {
            setError('Codul trebuie să aibă 6 cifre');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API}/api/auth/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ code }),
            });

            if (res.ok) {
                // Track email_verified
                trackEmailVerified();
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            } else {
                const data = await res.json();
                setError(data.message || 'Cod invalid. Încearcă din nou.');
                setCode('');
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }
        } catch (err) {
            setError('Eroare de conexiune la server');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendDisabled(true);
        setError('');
        
        try {
            await fetch(`${API}/api/auth/resend-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
        } catch (err) {
            console.error('Failed to resend code:', err);
        }

        // Reset countdown to 15 minutes
        setTimeRemaining(15 * 60);

        // Disable button for 60 seconds
        setTimeout(() => {
            setResendDisabled(false);
        }, 60000);
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-950 overflow-hidden">
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
                            Verifică-ți <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">adresa de email</span>
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed font-medium">
                            Un cod de verificare a fost trimis. Introdu-l mai jos pentru a-ți activa contul.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/10">
                        <div>
                            <p className="text-2xl font-bold text-white">15:00</p>
                            <p className="text-sm text-slate-500 font-semibold">Timp Limită</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">6 Cifre</p>
                            <p className="text-sm text-slate-500 font-semibold">Cod Unic</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950">
                <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700 slide-in-from-right-4">
                    <div className="space-y-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8 lg:hidden">
                            <Mail className="text-white" size={24} />
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight">Verifică Email-ul</h2>
                        <p className="text-slate-400 font-medium text-lg">
                            Cod trimis la: <strong className="text-white">{email}</strong>
                        </p>
                    </div>

                    {error && (
                        <div className="os-card !bg-red-500/10 !border-red-500/30 p-4 flex items-start gap-3 text-red-400 text-sm animate-in zoom-in-95">
                            <AlertCircle size={18} className="shrink-0" />
                            <p className="font-semibold">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="os-card !bg-green-500/10 !border-green-500/30 p-4 flex items-center gap-3 text-green-400 text-sm animate-in zoom-in-95">
                            <CheckCircle2 size={18} className="shrink-0" />
                            <p className="font-semibold">Email verificat cu succes! Redirecționare...</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Code Input */}
                        <div className="space-y-2">
                            <label htmlFor="code" className="text-sm font-bold text-slate-300 ml-1">
                                Cod de Verificare
                            </label>
                            <input
                                ref={inputRef}
                                id="code"
                                type="text"
                                inputMode="numeric"
                                value={code}
                                onChange={handleCodeChange}
                                className="w-full text-center text-3xl tracking-[0.5em] font-mono bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-600"
                                placeholder="000000"
                                maxLength={6}
                                disabled={loading || success}
                            />
                        </div>

                        {/* Countdown Timer */}
                        <div className="text-center">
                            <div className="text-3xl font-mono text-indigo-400 font-bold">
                                {formatTime(timeRemaining)}
                            </div>
                            <p className="text-slate-500 text-sm mt-1">Timp rămas pentru verificare</p>
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={handleVerify}
                            disabled={loading || success || code.length !== 6}
                            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : success ? (
                                <>
                                    <CheckCircle2 className="mr-2" size={20} />
                                    <span>Cont Verificat</span>
                                </>
                            ) : (
                                <span>Verifică Contul</span>
                            )}
                        </button>

                        {/* Resend Code */}
                        <div className="text-center pt-4 border-t border-slate-800">
                            <p className="text-slate-400 text-sm mb-3">Nu ai primit codul?</p>
                            <button
                                onClick={handleResend}
                                disabled={resendDisabled || loading}
                                className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                            >
                                <RefreshCw size={16} className={resendDisabled ? '' : 'hover:rotate-180 transition-transform duration-300'} />
                                {resendDisabled ? 'Reîncearcă în 60s' : 'Retrimite codul'}
                            </button>
                        </div>
                    </div>

                    <div className="text-center pt-8 border-t border-slate-800">
                        <p className="text-slate-500 font-medium text-sm">
                            Ai nevoie de ajutor?{' '}
                            <a href="mailto:suport@opensales.ro" className="text-blue-400 hover:text-blue-300 font-bold decoration-2 underline-offset-4 hover:underline">
                                Contactează suportul
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
