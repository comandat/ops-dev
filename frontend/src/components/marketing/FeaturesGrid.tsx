'use client';

import { Package, ShoppingCart, TrendingUp, BarChart3 } from 'lucide-react';
import FeatureCard from './FeatureCard';

export default function FeaturesGrid() {
  const features = [
    {
      icon: Package,
      title: 'Marketplace Sync',
      description: 'Sincronizare automată cu eMAG, Trendyol și FGO. Produse, stocuri și prețuri actualizate în timp real.',
    },
    {
      icon: ShoppingCart,
      title: 'Order Management',
      description: 'Gestionează toate comenzile dintr-o singură dashboard. Status, tracking și procesare unificată.',
    },
    {
      icon: TrendingUp,
      title: 'Pricing Automation',
      description: 'Reguli dinamice de prețuire. Adjustează automat prețurile în funcție de competitori și stoc.',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Insights detaliate despre vânzări, performanță produse și trenduri. Rapoarte exportabile.',
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Tot ce ai nevoie pentru{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              e-commerce
            </span>
          </h2>
          <p className="text-lg text-[#A1A1AA]">
            Platformă completă pentru gestionarea vânzărilor pe marketplace-uri
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
