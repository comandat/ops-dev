'use client';

import PricingCard from './PricingCard';

const pricingTiers = [
  {
    name: 'Free',
    price: '0€',
    description: 'Pentru început și testing',
    features: [
      'Până la 50 comenzi/lună',
      '1 marketplace conectat',
      'Sync de bază',
      'Suport prin email',
      'Acces la dashboard',
    ],
    ctaText: 'Începe Gratuit',
    ctaLink: '/register?plan=free',
    isPopular: false,
  },
  {
    name: 'Starter',
    price: '29€',
    description: 'Pentru business-uri mici',
    features: [
      'Până la 500 comenzi/lună',
      '3 marketplace-uri conectate',
      'Sync automat',
      'Suport prioritizat',
      'Rapoarte de bază',
      'Alerte stock low',
    ],
    ctaText: 'Începe Starter',
    ctaLink: '/register?plan=starter',
    isPopular: false,
  },
  {
    name: 'Pro',
    price: '79€',
    description: 'Pentru business-uri în creștere',
    features: [
      'Comenzi nelimitate',
      'Marketplace-uri nelimitate',
      'Sync în timp real',
      'Suport prioritizat 24/7',
      'Analytics avansate',
      'Automatizare prețuri',
      'API access',
    ],
    ctaText: 'Începe Pro',
    ctaLink: '/register?plan=pro',
    isPopular: true,
  },
  {
    name: 'Enterprise',
    price: '',
    description: 'Pentru organizații mari',
    features: [
      'Tot ce include Pro',
      'SLA garantat',
      'Manager dedicat',
      'Integrări custom',
      'Training echipă',
      'Onboarding asistat',
    ],
    ctaText: 'Contactează-ne',
    ctaLink: '/contact',
    isEnterprise: true,
    isPopular: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Planuri pentru fiecare etapă
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Alege planul care se potrivește cu business-ul tău. Fără costuri ascunse.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {pricingTiers.map((tier) => (
            <PricingCard
              key={tier.name}
              name={tier.name}
              price={tier.price}
              description={tier.description}
              features={tier.features}
              ctaText={tier.ctaText}
              ctaLink={tier.ctaLink}
              isPopular={tier.isPopular}
              isEnterprise={tier.isEnterprise}
            />
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 mb-4">
            Toate planurile includ
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Fără card de credit
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              14 zile trial gratuit
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Anulezi oricând
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              SSL securizat
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
