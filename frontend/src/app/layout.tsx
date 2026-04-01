import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OpenSales - Automatizează Vânzările pe Marketplace-uri',
  description: 'Platformă SaaS pentru gestionarea e-commerce pe eMAG, Trendyol, FGO. Sync automat, prețuri dinamice, ordine centralizate.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body className={`${inter.className} overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
