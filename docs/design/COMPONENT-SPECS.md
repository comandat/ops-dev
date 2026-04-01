# 🔧 Component Specifications - OpenSales Homepage

**Version**: 1.0  
**Created**: 2026-04-01  
**Author**: Andrei (UX Designer)  
**For**: Alex + Sorin (Frontend Developers)  
**Status**: ✅ Ready for Implementation

---

## 📋 Implementation Checklist

- [ ] Set up Tailwind config with design tokens (see DESIGN-SYSTEM.md)
- [ ] Create component folder structure
- [ ] Build components in order listed below
- [ ] Test responsive behavior at breakpoints: 390px, 768px, 1024px, 1280px
- [ ] Verify accessibility (contrast, focus states, keyboard navigation)
- [ ] Run Lighthouse audit (target: 90+ performance)

---

## 📁 File Structure

```
/components/marketing/
├── Navigation.tsx
├── Hero.tsx
├── StatsBar.tsx
├── FeatureCard.tsx
├── FeaturesGrid.tsx
├── PricingCard.tsx
├── PricingSection.tsx
├── CtaSection.tsx
├── Footer.tsx
└── index.ts (barrel export)

/app/(marketing)/
├── layout.tsx
└── page.tsx
```

---

## 1️⃣ Navigation Component

### Navigation.tsx

```tsx
// Props
interface NavigationProps {
  logo?: string;
  links?: Array<{ label: string; href: string }>;
  ctaText?: string;
  ctaHref?: string;
}

// Default Props
const defaultProps = {
  logo: "OpenSales",
  links: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
  ],
  ctaText: "Începe Gratuit",
  ctaHref: "/register",
};

// Tailwind Classes
const navClasses = `
  sticky top-0 z-100
  h-16
  bg-[rgba(10,10,15,0.8)] backdrop-blur-md
  border-b border-white/8
`;

const navContainerClasses = `
  max-w-7xl mx-auto px-6 md:px-12
  h-full flex items-center justify-between
`;

const logoClasses = `
  text-2xl font-bold text-white
  hover:opacity-80 transition-opacity
`;

const navLinkClasses = `
  text-sm font-medium text-gray-400
  hover:text-white transition-colors
  hidden md:block
`;

const loginButtonClasses = `
  text-sm font-medium text-gray-400
  hover:text-white transition-colors
  hidden md:block
`;

const ctaButtonClasses = `
  text-sm font-semibold
  px-5 py-2.5 rounded-md
  bg-gradient-to-r from-indigo-500 to-violet-500
  text-white
  hover:brightness-110 transition-all
  hidden md:block
`;

// Mobile Menu
// - Hamburger icon (24px) on mobile
// - Full-screen overlay or dropdown
// - Links stacked vertically
```

**Responsive Behavior:**
- Desktop (>768px): Logo | Links | Login + CTA
- Mobile (<768px): Hamburger | Logo | Login (CTA hidden or in menu)

---

## 2️⃣ Hero Component

### Hero.tsx

```tsx
// Props
interface HeroProps {
  headline?: string;
  subheadline?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  trustBadges?: string[];
}

// Default Props
const defaultProps = {
  headline: "Accelerăm vânzările tale.",
  subheadline: "Automatizare completă pentru Marketplace, Logistică și Facturare într-o singură platformă.",
  primaryCtaText: "Începe Gratuit",
  primaryCtaHref: "/register",
  secondaryCtaText: "Vezi Demo →",
  secondaryCtaHref: "#demo",
  trustBadges: ["14 zile trial gratuit", "Fără card credit necesar"],
};

// Container Classes
const containerClasses = `
  relative
  py-24 md:py-32
  px-6 md:px-12
  max-w-7xl mx-auto
  text-center
`;

// Headline Classes
const headlineClasses = `
  text-4xl md:text-6xl
  leading-10 md:leading-[72px]
  font-bold
  text-white
  max-w-3xl mx-auto
  mb-6
`;

// Subheadline Classes
const subheadlineClasses = `
  text-lg md:text-xl
  leading-7 md:leading-8
  font-normal
  text-gray-400
  max-w-2xl mx-auto
  mb-10
`;

// Button Container
const buttonContainerClasses = `
  flex flex-col sm:flex-row
  gap-4 md:gap-6
  justify-center
  mb-8
`;

// Primary Button
const primaryButtonClasses = `
  px-8 py-4 md:px-10 md:py-4
  text-base md:text-lg font-semibold
  rounded-lg
  bg-gradient-to-r from-indigo-500 to-violet-500
  text-white
  hover:brightness-110 hover:-translate-y-0.5
  transition-all duration-200
  shadow-lg shadow-indigo-500/25
  w-full sm:w-auto
`;

// Secondary Button
const secondaryButtonClasses = `
  px-8 py-4 md:px-10 md:py-4
  text-base md:text-lg font-semibold
  rounded-lg
  border border-white/20
  text-white
  hover:bg-white/5 hover:border-white/30
  transition-all duration-200
  w-full sm:w-auto
`;

// Trust Badges
const trustBadgeClasses = `
  flex flex-col sm:flex-row
  gap-4 sm:gap-8
  justify-center
  text-sm text-gray-500
`;

const trustBadgeItemClasses = `
  flex items-center gap-2
`;

const checkmarkClasses = `
  w-4 h-4
  text-emerald-500
`;
```

**Animation Suggestion:**
```tsx
// Framer Motion (optional)
const heroVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};
```

---

## 3️⃣ Stats Bar Component

### StatsBar.tsx

```tsx
// Props
interface Stat {
  value: string;
  label: string;
}

interface StatsBarProps {
  stats: Stat[];
}

// Default Props
const defaultProps = {
  stats: [
    { value: "99.9%", label: "Uptime" },
    { value: "2,000+", label: "Comenzi/minut" },
  ],
};

// Container Classes
const containerClasses = `
  py-12 md:py-16
  px-6 md:px-12
  bg-[#121217]
  border-y border-white/8
`;

const innerClasses = `
  max-w-7xl mx-auto
  flex flex-col sm:flex-row
  justify-center
  gap-8 md:gap-24
`;

// Stat Item Classes
const statItemClasses = `
  flex flex-col items-center
  text-center
`;

const statValueClasses = `
  text-3xl md:text-5xl
  font-bold
  bg-gradient-to-r from-indigo-500 to-violet-500
  bg-clip-text text-transparent
  mb-2
`;

const statLabelClasses = `
  text-base md:text-lg
  font-normal
  text-gray-400
`;
```

---

## 4️⃣ Feature Card Component

### FeatureCard.tsx

```tsx
// Props
interface FeatureCardProps {
  icon: React.ReactNode; // SVG or Lucide icon
  title: string;
  description: string;
}

// Container Classes
const cardClasses = `
  p-8
  bg-[#121217]
  border border-white/8
  rounded-xl
  hover:border-white/15
  hover:-translate-y-0.5
  hover:shadow-xl hover:shadow-black/40
  transition-all duration-200
  flex flex-col
  h-full
`;

// Icon Container
const iconContainerClasses = `
  w-12 h-12
  mb-5
  text-indigo-500
`;

// Title Classes
const titleClasses = `
  text-xl font-semibold
  text-white
  mb-3
`;

// Description Classes
const descriptionClasses = `
  text-base leading-6
  text-gray-400
  flex-1
`;
```

### FeaturesGrid.tsx

```tsx
// Props
interface FeaturesGridProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  features: FeatureCardProps[];
}

// Default Props
const defaultProps = {
  sectionTitle: "Tot ce ai nevoie pentru e-commerce",
  sectionSubtitle: "într-o singură platformă",
  features: [
    {
      icon: <ShoppingCartIcon />,
      title: "Marketplace Sync",
      description: "Sync automat eMAG, Trendyol, FGO",
    },
    {
      icon: <PackageIcon />,
      title: "Order Management",
      description: "Dashboard unificat pentru toate comenzile",
    },
    {
      icon: <DollarSignIcon />,
      title: "Pricing Automation",
      description: "Reguli dinamice prețuri competitive",
    },
    {
      icon: <BarChartIcon />,
      title: "Analytics & Reports",
      description: "Rapoarte vânzări în timp real",
    },
  ],
};

// Section Container
const sectionClasses = `
  py-24 md:py-32
  px-6 md:px-12
  max-w-7xl mx-auto
`;

// Section Header
const headerClasses = `
  text-center
  mb-16
`;

const sectionTitleClasses = `
  text-3xl md:text-5xl
  leading-10 md:leading-[56px]
  font-semibold
  text-white
  mb-4
`;

const sectionSubtitleClasses = `
  text-lg md:text-xl
  text-gray-400
`;

// Grid Layout
const gridClasses = `
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4
  gap-6
`;
```

---

## 5️⃣ Pricing Card Component

### PricingCard.tsx

```tsx
// Props
interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: PricingFeature[];
  ctaText: string;
  ctaHref: string;
  isPopular?: boolean;
  variant?: 'free' | 'starter' | 'pro' | 'enterprise';
}

// Container Classes
const cardClasses = `
  relative
  p-8 md:p-10
  bg-[#121217]
  border rounded-2xl
  flex flex-col
  min-h-[480px]
  transition-all duration-200
  hover:border-white/15
  hover:-translate-y-1
  hover:shadow-xl hover:shadow-black/40
`;

const popularCardClasses = `
  border-2 border-indigo-500
  shadow-lg shadow-indigo-500/10
`;

// Popular Badge
const badgeClasses = `
  absolute
  -top-3 left-1/2 -translate-x-1/2
  px-4 py-1
  bg-gradient-to-r from-indigo-500 to-violet-500
  text-white
  text-xs font-bold uppercase tracking-wide
  rounded-full
`;

// Name
const nameClasses = `
  text-sm font-semibold uppercase tracking-wider
  text-gray-400
  mb-2
`;

// Price
const priceContainerClasses = `
  mb-2
`;

const priceClasses = `
  text-4xl md:text-5xl
  font-bold
  text-white
`;

const periodClasses = `
  text-base
  text-gray-500
`;

// Features List
const featuresListClasses = `
  flex-1
  my-8
  space-y-3
`;

const featureItemClasses = `
  flex items-start gap-3
  text-base text-gray-400
`;

const featureCheckClasses = `
  w-5 h-5
  mt-0.5
  flex-shrink-0
`;

const checkIncludedClasses = `
  text-emerald-500
`;

const checkExcludedClasses = `
  text-gray-600
`;

// CTA Button
const ctaClasses = `
  w-full
  py-3 px-6
  text-base font-semibold
  rounded-lg
  text-center
  transition-all duration-200
`;

const ctaPrimaryClasses = `
  bg-gradient-to-r from-indigo-500 to-violet-500
  text-white
  hover:brightness-110
  shadow-lg shadow-indigo-500/25
`;

const ctaSecondaryClasses = `
  border border-white/20
  text-white
  hover:bg-white/5 hover:border-white/30
`;
```

### PricingSection.tsx

```tsx
// Props
interface PricingSectionProps {
  sectionTitle?: string;
  plans: PricingCardProps[];
}

// Default Props
const defaultProps = {
  sectionTitle: "Planuri simple, fără surprize",
  plans: [
    {
      name: "FREE",
      price: "€0",
      period: "/lună",
      features: [
        { text: "50 comenzi/lună", included: true },
        { text: "1 user", included: true },
        { text: "Basic sync", included: true },
        { text: "Email support", included: true },
      ],
      ctaText: "Start",
      ctaHref: "/register?plan=free",
      variant: 'free',
    },
    {
      name: "STARTER",
      price: "€29",
      period: "/lună",
      features: [
        { text: "500 comenzi/lună", included: true },
        { text: "3 users", included: true },
        { text: "Advanced sync", included: true },
        { text: "Priority support", included: true },
      ],
      ctaText: "Try Free",
      ctaHref: "/register?plan=starter",
      isPopular: true,
      variant: 'starter',
    },
    {
      name: "PRO",
      price: "€79",
      period: "/lună",
      features: [
        { text: "2000 comenzi/lună", included: true },
        { text: "10 users", included: true },
        { text: "All features", included: true },
        { text: "Dedicated support", included: true },
      ],
      ctaText: "Start",
      ctaHref: "/register?plan=pro",
      variant: 'pro',
    },
    {
      name: "ENTERPRISE",
      price: "Custom",
      period: "",
      features: [
        { text: "Unlimited comenzi", included: true },
        { text: "Unlimited users", included: true },
        { text: "Everything in Pro", included: true },
        { text: "Priority support + SLA", included: true },
      ],
      ctaText: "Contact Sales",
      ctaHref: "/contact",
      variant: 'enterprise',
    },
  ],
};

// Section Classes
const sectionClasses = `
  py-24 md:py-32
  px-6 md:px-12
  max-w-7xl mx-auto
`;

const headerClasses = `
  text-center
  mb-16
`;

const sectionTitleClasses = `
  text-3xl md:text-5xl
  leading-10 md:leading-[56px]
  font-semibold
  text-white
  mb-4
`;

// Grid Layout
const gridClasses = `
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4
  gap-6
  items-start
`;
```

---

## 6️⃣ CTA Section Component

### CtaSection.tsx

```tsx
// Props
interface CtaSectionProps {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaHref?: string;
  trustBadges?: string[];
}

// Default Props
const defaultProps = {
  headline: "Gata să-ți automatizezi vânzările?",
  subheadline: "Începe acum - 14 zile trial gratuit",
  ctaText: "ÎNCEPE GRATUIT ACUM",
  ctaHref: "/register",
  trustBadges: ["Fără card credit necesar", "Setup în 5 minute"],
};

// Container Classes
const containerClasses = `
  py-24 md:py-32
  px-6 md:px-12
  bg-[#121217]
`;

const innerClasses = `
  max-w-3xl mx-auto
  text-center
`;

// Headline
const headlineClasses = `
  text-3xl md:text-5xl
  leading-10 md:leading-[48px]
  font-bold
  text-white
  mb-6
`;

// Subheadline
const subheadlineClasses = `
  text-lg md:text-xl
  leading-7 md:leading-8
  text-gray-400
  mb-10
`;

// CTA Button (XL size)
const ctaButtonClasses = `
  w-full sm:w-auto
  px-12 py-4 md:px-16 md:py-5
  text-lg font-bold
  rounded-lg
  bg-gradient-to-r from-indigo-500 to-violet-500
  text-white
  hover:brightness-110 hover:-translate-y-0.5
  transition-all duration-200
  shadow-xl shadow-indigo-500/30
`;

// Trust Badges
const badgesContainerClasses = `
  mt-10
  flex flex-col sm:flex-row
  gap-4 sm:gap-8
  justify-center
`;

const badgeItemClasses = `
  flex items-center gap-2
  text-sm text-gray-500
`;

const badgeCheckClasses = `
  w-4 h-4
  text-emerald-500
`;
```

---

## 7️⃣ Footer Component

### Footer.tsx

```tsx
// Props
interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  logo?: string;
  description?: string;
  columns: FooterColumn[];
  contact?: string;
  copyright?: string;
}

// Default Props
const defaultProps = {
  logo: "OpenSales",
  description: "Automatizare e-commerce",
  columns: [
    {
      title: "Features",
      links: [
        { label: "Marketplace Sync", href: "#features" },
        { label: "Order Management", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Analytics", href: "#features" },
      ],
    },
    {
      title: "Pricing",
      links: [
        { label: "Planuri", href: "#pricing" },
        { label: "Enterprise", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Careers", href: "/careers" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "GDPR", href: "/gdpr" },
      ],
    },
  ],
  contact: "hello@opensales.ro",
  copyright: "© 2026 OpenSales. Toate drepturile rezervate.",
};

// Container Classes
const containerClasses = `
  pt-16 pb-8
  px-6 md:px-12
  border-t border-white/8
`;

const innerClasses = `
  max-w-7xl mx-auto
`;

// Grid Layout
const gridClasses = `
  grid grid-cols-2 md:grid-cols-5
  gap-8 md:gap-12
  mb-12
`;

// Logo Column (spans 2 columns on mobile, 1 on desktop)
const logoColumnClasses = `
  col-span-2 md:col-span-1
`;

const logoClasses = `
  text-xl font-bold text-white
  mb-2
`;

const descriptionClasses = `
  text-sm text-gray-500
  mb-4
`;

// Link Columns
const columnClasses = `
  flex flex-col
  gap-3
`;

const columnTitleClasses = `
  text-sm font-semibold text-white
  mb-2
`;

const linkClasses = `
  text-sm text-gray-400
  hover:text-white
  transition-colors
`;

// Bottom Bar
const bottomBarClasses = `
  pt-8
  border-t border-white/8
  flex flex-col md:flex-row
  justify-between items-center
  gap-4
`;

const contactClasses = `
  text-sm text-gray-500
`;

const copyrightClasses = `
  text-sm text-gray-500
`;
```

---

## 🎨 Tailwind Configuration

Add to `tailwind.config.js`:

```js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0A0A0F',
          surface: '#121217',
          elevated: '#1A1A24',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          tertiary: '#71717A',
          muted: '#52525B',
        },
        primary: {
          500: '#6366F1',
          600: '#4F46E5',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          medium: 'rgba(255, 255, 255, 0.12)',
          strong: 'rgba(255, 255, 255, 0.20)',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      },
      fontSize: {
        'display-xl': ['64px', { lineHeight: '72px', fontWeight: '700' }],
        'display-lg': ['56px', { lineHeight: '64px', fontWeight: '700' }],
        'display-md': ['48px', { lineHeight: '56px', fontWeight: '600' }],
        'headline-xl': ['40px', { lineHeight: '48px', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600' }],
      },
      zIndex: {
        '100': '100',
      },
    },
  },
  plugins: [],
}
```

---

## 🧪 Testing Checklist

### Performance
- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s
- [ ] FCP < 1.5s
- [ ] CLS < 0.1
- [ ] Bundle size < 150KB (homepage only)

### Accessibility
- [ ] All images have alt text
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus states visible on all interactive elements
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] ARIA labels on icons and buttons

### Responsive
- [ ] Test at 390px (iPhone)
- [ ] Test at 768px (iPad portrait)
- [ ] Test at 1024px (iPad landscape)
- [ ] Test at 1280px (Desktop)
- [ ] Test at 1920px (Large desktop)

### Browser Support
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## 📞 Handoff Notes

**For Alex + Sorin:**

1. **Start with the design tokens** - Set up Tailwind config first
2. **Build components in order** - Navigation → Hero → Stats → Features → Pricing → CTA → Footer
3. **Use the exact class names** provided above for consistency
4. **Test responsive behavior early** - Don't wait until the end
5. **Icons** - Use Lucide React or Heroicons (consistent style)
6. **Animations** - Optional, use Framer Motion if adding
7. **Questions?** - Check DESIGN-SYSTEM.md or ask Andrei

**Priority Order:**
1. ✅ Navigation + Hero (first impression)
2. ✅ Features Grid (core value prop)
3. ✅ Pricing Section (conversion driver)
4. ✅ CTA + Footer (completing the page)
5. ✅ Stats Bar (social proof)

---

## ✅ Component Specs Status

**Status**: ✅ Complete - Ready for Implementation

**All Design Files:**
- `REFERENCES.md` - Research & moodboard ✅
- `WIREFRAME.md` - Low-fidelity structure ✅
- `DESIGN-SYSTEM.md` - Design tokens ✅
- `MOCKUPS-SPECS.md` - Visual mockups ✅
- `COMPONENT-SPECS.md` - This file (developer handoff) ✅

**Next Step**: Alex + Sorin begin implementation

---

**Created**: 2026-04-01  
**Handoff Ready**: Yes  
**Contact**: Andrei (UX Designer) for clarifications
