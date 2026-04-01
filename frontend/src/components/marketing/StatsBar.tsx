'use client';

import { Zap, Activity } from 'lucide-react';

export default function StatsBar() {
  return (
    <section className="py-12 border-y border-[rgba(255,255,255,0.08)]">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Stat 1 */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 mb-3">
              <Zap size={24} />
            </div>
            <p className="text-3xl md:text-4xl font-bold text-white">99.9%</p>
            <p className="text-sm text-[#71717A] font-medium">Uptime Garantat</p>
          </div>
          
          {/* Stat 2 */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 mb-3">
              <Activity size={24} />
            </div>
            <p className="text-3xl md:text-4xl font-bold text-white">2k+</p>
            <p className="text-sm text-[#71717A] font-medium">Comenzi / Minut</p>
          </div>
          
          {/* Stat 3 */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 mb-3">
              <Zap size={24} />
            </div>
            <p className="text-3xl md:text-4xl font-bold text-white">3+</p>
            <p className="text-sm text-[#71717A] font-medium">Marketplace-uri</p>
          </div>
          
          {/* Stat 4 */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 mb-3">
              <Activity size={24} />
            </div>
            <p className="text-3xl md:text-4xl font-bold text-white">24/7</p>
            <p className="text-sm text-[#71717A] font-medium">Suport Tehnic</p>
          </div>
        </div>
      </div>
    </section>
  );
}
