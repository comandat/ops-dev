'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface EasySalesMigrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EasySalesMigrationModal({ isOpen, onClose, onSuccess }: EasySalesMigrationModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [productsFile, setProductsFile] = useState<File | null>(null);
    const [offersFiles, setOffersFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    if (!isOpen) return null;

    const handleSkip = () => {
        onSuccess();
    };

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleSubmit = async () => {
        if (!productsFile) {
            setError('Exportul de Produse este obligatoriu pentru a continua.');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('products', productsFile);

        offersFiles.forEach((file) => {
            formData.append('offers', file);
        });

        try {
            const url = `/api/import/easysales`;
            console.log(`[EasySalesMigrationModal] Initiating Fetch to: ${url}`);

            const res = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            console.log(`[EasySalesMigrationModal] Response Status: ${res.status}`);

            if (res.ok) {
                console.log(`[EasySalesMigrationModal] Migration success!`);
                onSuccess();
            } else {
                const text = await res.text();
                console.error(`[EasySalesMigrationModal] Backend error (${res.status}): ${text}`);
                let msg = 'Eroare la procesarea fișierelor de migrare.';
                try {
                    const data = JSON.parse(text);
                    msg = data.message || msg;
                } catch (e) { }
                setError(msg);
            }
        } catch (err) {
            console.error('[EasySalesMigrationModal] Connection error:', err);
            setError('Eroare de conexiune la server.');
        } finally {
            setLoading(false);
        }
    };

    const removeOfferFile = (index: number) => {
        setOffersFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Bine ai venit!</h2>
                            <p className="text-slate-500 font-medium mt-1">Cum dorești să începi setup-ul contului tău OpenSales?</p>
                        </div>
                        <button onClick={handleSkip} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="font-medium text-sm">{error}</p>
                        </div>
                    )}

                    {step === 1 ? (
                        <div className="space-y-4">
                            <button
                                onClick={handleSkip}
                                className="w-full p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                        <CheckCircle2 className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Pornesc de la zero (Opțiune Standard)</h3>
                                        <p className="text-slate-500 text-sm mt-1">Vreau să adaug produsele și ofertele manual, sau să testez platforma.</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={handleNext}
                                className="w-full p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                        <Upload className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-blue-900">Import din EasySales (Recomandat)</h3>
                                        <p className="text-blue-600/80 text-sm mt-1">Migrează automat toate produsele și ofertele eMAG / Trendyol dintr-un export CSV/Excel.</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">1. Fișier Export Produse (Obligatoriu)</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-blue-400 transition-colors bg-slate-50 text-center relative">
                                    <input
                                        type="file"
                                        accept=".xlsx,.csv"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setProductsFile(e.target.files?.[0] || null)}
                                    />
                                    <div className="flex flex-col items-center justify-center pointer-events-none">
                                        <FileSpreadsheet className={`w-8 h-8 mb-2 ${productsFile ? 'text-green-500' : 'text-slate-400'}`} />
                                        <span className="font-medium text-slate-700">
                                            {productsFile ? productsFile.name : 'Apasă sau trage fișierul de produse aici'}
                                        </span>
                                        <span className="text-xs text-slate-400 mt-1">Doar .xlsx sau .csv din EasySales</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">2. Fișiere Export Oferte - eMAG, Trendyol (Opțional)</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-blue-400 transition-colors bg-slate-50 text-center relative overflow-hidden">
                                    <input
                                        type="file"
                                        multiple
                                        accept=".xlsx,.csv"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                setOffersFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
                                            }
                                        }}
                                    />
                                    <div className="flex flex-col items-center justify-center pointer-events-none">
                                        <Upload className={`w-8 h-8 mb-2 ${offersFiles.length > 0 ? 'text-blue-500' : 'text-slate-400'}`} />
                                        <span className="font-medium text-slate-700">
                                            Apasă sau trage fișierele de oferte aici
                                        </span>
                                        <span className="text-xs text-slate-400 mt-1">Poți adăuga mai multe fișiere (ex: eMAG și Trendyol separat)</span>
                                    </div>
                                </div>
                                {offersFiles.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {offersFiles.map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-100">
                                                <FileSpreadsheet className="w-3 h-3" />
                                                <span className="truncate max-w-[150px]">{f.name}</span>
                                                <button type="button" onClick={() => removeOfferFile(i)} className="text-blue-400 hover:text-blue-600 ml-1">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                                <button
                                    onClick={handleBack}
                                    type="button"
                                    className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Înapoi
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !productsFile}
                                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed ml-4"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2 inline" />
                                            Se procesează migrarea...
                                        </>
                                    ) : (
                                        'Finalizare și Migrare'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
