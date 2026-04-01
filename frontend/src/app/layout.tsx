import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/AppShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OpenSales Dashboard',
  description: 'Self-Hosted Multi-channel E-commerce Automation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f8f9fa] text-gray-900 overflow-x-hidden`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
