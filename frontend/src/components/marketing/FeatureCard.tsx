'use client';

import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-8 bg-[#121217] border border-[rgba(255,255,255,0.08)] rounded-2xl hover:border-[rgba(255,255,255,0.15)] hover:-translate-y-1 transition-all duration-300">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-[#A1A1AA] leading-relaxed">{description}</p>
    </div>
  );
}
