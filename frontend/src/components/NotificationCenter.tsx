'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Bell, X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: Date;
}

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Fetch current user status to get tenantId
        const initSocket = async () => {
            try {
                const res = await fetch(`${API}/auth/status`);
                if (!res.ok) return;
                const user = await res.json();

                const tenantId = user.tenantId || 'default';

                socketRef.current = io(API, {
                    query: { tenantId }
                });

                socketRef.current.on('notification', (notif: any) => {
                    const newNotif = {
                        ...notif,
                        id: Math.random().toString(36).substr(2, 9),
                        timestamp: new Date(notif.timestamp)
                    };
                    setNotifications(prev => [newNotif, ...prev].slice(0, 20));

                    // Auto-open if it's an error or important
                    if (notif.type === 'error') setIsOpen(true);
                });
            } catch (err) {
                console.error('Failed to init notification socket', err);
            }
        };

        initSocket();

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const unreadCount = notifications.length;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <div className="p-4 border-b border-slate-800 flex items-start justify-between">
                            <h3 className="font-bold text-white">Notificări</h3>
                            <button onClick={() => setNotifications([])} className="text-xs text-slate-500 hover:text-slate-300">Șterge tot</button>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 space-y-2">
                                    <Bell size={32} className="mx-auto opacity-20" />
                                    <p className="text-sm">Nicio notificare nouă</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-800">
                                    {notifications.map((n) => (
                                        <div key={n.id} className="p-4 hover:bg-slate-800/50 transition-colors group relative">
                                            <div className="flex gap-3">
                                                <div className="mt-1">
                                                    {n.type === 'success' && <CheckCircle size={16} className="text-emerald-500" />}
                                                    {n.type === 'error' && <AlertCircle size={16} className="text-red-500" />}
                                                    {n.type === 'info' && <Info size={16} className="text-blue-500" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate">{n.title}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                                                    <p className="text-[10px] text-slate-600 mt-2">
                                                        {new Date(n.timestamp).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeNotification(n.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-slate-400 transition-all"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
