import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OpenSales - Automatizează Vânzările pe Marketplace-uri',
  description:
    'Platformă SaaS pentru gestionarea e-commerce pe eMAG, Trendyol, FGO. Sync automat, prețuri dinamice, ordine centralizate.',
  openGraph: {
    title: 'OpenSales - Automatizează Vânzările pe Marketplace-uri',
    description:
      'Platformă SaaS pentru gestionarea e-commerce pe eMAG, Trendyol, FGO.',
    type: 'website',
    locale: 'ro_RO',
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {children}
    </div>
  );
}
