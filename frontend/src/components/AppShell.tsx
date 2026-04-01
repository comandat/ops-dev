'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        // Only connect if we are NOT on auth pages
        if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) return;

        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
            withCredentials: true,
            transports: ['websocket', 'polling'], // Fallback safely
        });

        socket.on('notification', (data) => {
            if (data.type === 'success') toast.success(data.message, { id: data.timestamp?.toString() });
            else if (data.type === 'error') toast.error(data.message, { id: data.timestamp?.toString() });
            else toast(data.message, { id: data.timestamp?.toString(), icon: 'ℹ️' });
        });

        return () => {
            socket.disconnect();
        };
    }, [pathname]);

    // Check if the current route is an authentication page
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

    if (isAuthPage) {
        return (
            <main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
                <Toaster position="top-right" />
                {children}
            </main>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'os-card !rounded-xl !border-slate-200 !text-slate-800',
                    duration: 4000,
                }}
            />
            <Sidebar />
            <div className="flex-1 ml-[var(--sidebar-width)] flex flex-col min-w-0">
                <Header />
                <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
