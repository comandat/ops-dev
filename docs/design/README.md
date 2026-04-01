# 🎨 OpenSales Homepage Design

**Project**: OpenSales Marketing Homepage  
**Designer**: Andrei (UX Designer)  
**Status**: ✅ Complete - Ready for Development  
**Handoff Date**: 2026-04-01

---

## 📁 Design Files

| File | Purpose | Status |
|------|---------|--------|
| `REFERENCES.md` | Research & moodboard from Stripe, Linear, Raycast, Supermetrics | ✅ Complete |
| `WIREFRAME.md` | Low-fidelity wireframes (desktop + mobile) | ✅ Complete |
| `DESIGN-SYSTEM.md` | Design tokens, colors, typography, components | ✅ Complete |
| `MOCKUPS-SPECS.md` | High-fidelity mockup specifications | ✅ Complete |
| `COMPONENT-SPECS.md` | Developer handoff with exact Tailwind classes | ✅ Complete |

---

## 🎯 Design Overview

### Theme
- **Style**: Dark Premium
- **Vibe**: Modern, clean, professional
- **Inspiration**: Stripe.com, Linear.app, Raycast.com

### Color Palette
- **Background**: `#0A0A0F` (near black with blue tint)
- **Surface**: `#121217` (cards, sections)
- **Primary Gradient**: Indigo-500 → Violet-500
- **Text**: White (#FFFFFF) to Gray (#A1A1AA, #71717A)

### Typography
- **Font**: Inter (or system sans-serif)
- **Hero Headline**: 64px / 700 weight (desktop), 40px (mobile)
- **Body**: 16px / 400 weight

---

## 📐 Homepage Structure

```
1. Navigation (sticky, 64px height)
2. Hero Section (headline, subheadline, 2 CTAs, trust badges)
3. Stats Bar (99.9% Uptime, 2,000+ Comenzi/min)
4. Features Grid (4 cards: Marketplace, Orders, Pricing, Analytics)
5. Pricing Section (4 tiers: Free, Starter, Pro, Enterprise)
6. Final CTA (conversion-focused)
7. Footer (links, contact, legal)
```

---

## 🚀 Implementation Guide

### For Developers (Alex + Sorin)

1. **Start Here**: `COMPONENT-SPECS.md` - Contains exact Tailwind classes
2. **Design Tokens**: `DESIGN-SYSTEM.md` - Colors, typography, spacing
3. **Visual Reference**: `MOCKUPS-SPECS.md` - Detailed measurements
4. **Structure**: `WIREFRAME.md` - Layout and flow

### Component Order
1. Navigation.tsx
2. Hero.tsx
3. StatsBar.tsx
4. FeaturesGrid.tsx + FeatureCard.tsx
5. PricingSection.tsx + PricingCard.tsx
6. CtaSection.tsx
7. Footer.tsx

### File Location
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
└── index.ts

/app/(marketing)/
├── layout.tsx
└── page.tsx
```

---

## ✅ Acceptance Criteria

- [ ] Design looks **premium** (not generic/template)
- [ ] Dark theme consistent with existing login page
- [ ] Mobile-first responsive design
- [ ] Clear typography hierarchy
- [ ] CTA buttons visible and attractive
- [ ] Pricing cards easy to compare
- [ ] Developer specs clear (no ambiguities)

---

## 📞 Contact

**Designer**: Andrei (UX Designer)  
**PM**: Bogdan  
**Developers**: Alex + Sorin

For questions or clarifications during implementation, check the design files or reach out.

---

## 📅 Timeline

- **Day 1**: ✅ Design complete (Andrei)
- **Day 2-3**: ⏳ Implementation (Alex + Sorin)
- **Day 3**: Integration + Deploy (Radu)
- **Day 4**: QA + Fixes (Cătălin)

---

**Last Updated**: 2026-04-01  
**Version**: 1.0
