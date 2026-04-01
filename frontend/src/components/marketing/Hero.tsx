'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-indigo-600/20 to-transparent rounded-full blur-[120px] -z-10"></div>
      
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Accelerăm{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              vânzările tale.
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
            Automatizare completă pentru Marketplace, Logistică și Facturare.
            Gestionează eMAG, Trendyol și FGO dintr-o singură platformă.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg hover:from-indigo-600 hover:to-violet-600 transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              Începe Gratuit
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border border-[rgba(255,255,255,0.2)] rounded-lg hover:bg-white/5 transition-all duration-200"
            >
              Vezi Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
