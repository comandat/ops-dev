'use client';

import { Check } from 'lucide-react';

export interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  isPopular?: boolean;
  isEnterprise?: boolean;
}

export default function PricingCard({
  name,
  price,
  period = '/lună',
  description,
  features,
  ctaText,
  ctaLink,
  isPopular = false,
  isEnterprise = false,
}: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
        isPopular
          ? 'bg-[#121217] border-indigo-500/50 shadow-lg shadow-indigo-500/20 scale-105 z-10'
          : 'bg-[#121217] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-500 text-white uppercase tracking-wider">
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-white mb-2">{name}</h3>
        <p className="text-sm text-[#A1A1AA] mb-4">{description}</p>
        
        <div className="flex items-baseline justify-center">
          {isEnterprise ? (
            <span className="text-4xl font-bold text-white">Custom</span>
          ) : (
            <>
              <span className="text-4xl font-bold text-white">{price}</span>
              <span className="text-[#A1A1AA] ml-1">{period}</span>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#A1A1AA]">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <a
        href={ctaLink}
        className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-center transition-all duration-200 ${
          isPopular
            ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 shadow-lg shadow-indigo-500/25'
            : 'bg-[#1A1A1F] text-white hover:bg-[#222227] border border-[rgba(255,255,255,0.08)]'
        }`}
      >
        {ctaText}
      </a>
    </div>
  );
}
