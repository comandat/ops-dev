# PRD - OpenSales Homepage (Marketing Site)

**Version**: 1.0  
**Date**: 2026-04-01  
**Owner**: Bogdan (PM)  
**Status**: 🟢 Approved for Development

---

## 1. Problem Statement

**User Pain**: Potențialii clienți (merchants, e-commerce managers) nu au o imagine clară despre ce oferă OpenSales înainte de a se loga. Nu există o prezență publică care să comunice valoarea platformei.

**Business Impact**: Fără homepage, conversia de la visitor → signup este aproape zero. Competitorii (eMAG Marketplace tools, alte SaaS-uri) au landing pages profesionale care inspiră încredere.

**Evidence**: 
- Frontend actual are doar login page (`/login`)
- Nu există cale de a afla despre platformă fără cont
- Pricing, features, beneficii - toate ascunse

---

## 2. Goals & Success Metrics

### Primary Goals
| Metric | Baseline | Target (30 days post-launch) |
|--------|----------|------------------------------|
| Homepage → Signup conversion | 0% | 5-8% |
| Time on page | N/A | >90 seconds |
| Bounce rate | N/A | <40% |

### Secondary Goals
- Brand perception: "premium", "trustworthy", "modern"
- Clear value proposition în <5 seconds
- Mobile traffic support (>40% expected)

### Non-Goals (v1.0)
- Blog / content marketing
- Customer testimonials (no customers yet)
- Multi-language (RO only for now)
- Custom domain (Railway subdomain OK for dev)

---

## 3. User Personas & Stories

### Persona 1: E-commerce Manager (Primary)
- **Name**: Andrei, 35 ani
- **Role**: Manager operațiuni e-commerce la retailer mediu
- **Pain**: pierde ore cu sync manual între eMAG, Trendyol și contabilitate
- **Goal**: automatizare, vizibilitate centralizată
- **Tech savvy**: Medium

### Persona 2: Business Owner (Secondary)
- **Name**: Maria, 42 ani
- **Role**: Owner la magazin online în creștere
- **Pain**: nu are timp să învețe tool-uri complicate
- **Goal**: soluție simplă, "just works"
- **Tech savvy**: Low-Medium

### User Stories
| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US1 | Ca visitor, vreau să înțeleg ce face OpenSales în <10 secunde | Hero section are headline clar + subheadline explicativ |
| US2 | Ca visitor, vreau să văd beneficiile principale | 3-4 feature cards cu iconițe + descriere scurtă |
| US3 | Ca visitor, vreau să văd planurile de preț | 3-4 pricing cards cu features listate clar |
| US4 | Ca visitor, vreau să pot începe gratuit | CTA vizibil care duce la `/register` |
| US5 | Ca mobile user, vreau experiență optimizată | Responsive design, touch-friendly buttons |
| US6 | Ca visitor, vreau să am încredere în platformă | Social proof (stats), design premium, professional copy |

---

## 4. Solution Overview

### Information Architecture
```
Homepage (/)
├── Hero Section
│   ├── Headline: "Accelerăm vânzările tale."
│   ├── Subheadline: "Automatizare completă pentru Marketplace, Logistică și Facturare."
│   ├── CTA Primary: "Începe Gratuit"
│   └── CTA Secondary: "Vezi Demo"
├── Stats Bar
│   ├── 99.9% Uptime
│   └── 2k+ Comenzi / Minut
├── Features Section
│   ├── Marketplace Sync (eMAG, Trendyol, FGO)
│   ├── Order Management (unified dashboard)
│   ├── Pricing Automation (dynamic rules)
│   └── Analytics & Reporting
├── Pricing Section
│   ├── Free (0€/lună)
│   ├── Starter (29€/lună)
│   ├── Pro (79€/lună)
│   └── Enterprise (custom)
├── Final CTA
│   └── "Începe acum - 14 zile trial gratuit"
└── Footer
    ├── Links (About, Features, Pricing)
    ├── Contact
    └── Legal (Terms, Privacy)
```

### Key Design Decisions
1. **Dark mode premium** - consistent cu existing login page aesthetic
2. **Gradient accents** - albastru/violet pentru tech feel
3. **Large typography** - headline-first approach
4. **Whitespace generous** - breathing room, premium feel
5. **Micro-interactions** - hover effects, smooth scrolling

---

## 5. Technical Considerations

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (existing)
- **Animations**: Framer Motion (optional, pentru subtle effects)
- **Icons**: Lucide React / Heroicons

### Components Needed
```
/components/marketing/
├── Hero.tsx
├── StatsBar.tsx
├── FeatureCard.tsx
├── FeaturesGrid.tsx
├── PricingCard.tsx
├── PricingSection.tsx
├── CtaSection.tsx
└── Footer.tsx
```

### Routes
```
/app/
├── (marketing)/
│   ├── layout.tsx (no auth required)
│   └── page.tsx (homepage)
├── (dashboard)/
│   └── ... (existing auth-required app)
└── login/
    └── ... (existing)
```

### Performance Requirements
- **LCP**: <2.5s
- **FCP**: <1.5s
- **CLS**: <0.1
- **Bundle size**: <150KB (homepage only)

### SEO Basics (v1.0)
- Meta title: "OpenSales - Automatizează Vânzările pe Marketplace-uri"
- Meta description: "Platformă SaaS pentru gestionarea e-commerce pe eMAG, Trendyol, FGO. Sync automat, prețuri dinamice, ordine centralizate."
- Open Graph tags for social sharing

---

## 6. Dependencies & Risks

### Dependencies
| Item | Owner | Status |
|------|-------|--------|
| Design direction (dark theme) | Andrei (UX) | ✅ Defined |
| Component library setup | Andrei + Alex | ⏳ Pending |
| Deploy pipeline (Railway) | Radu | ✅ Ready |

### Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Design nu e "premium" enough | High | Andrei să folosească referințe (stripe.com, linear.app) |
| Pricing copy nu e clar | Medium | Bogdan să revizuiască textele înainte de deploy |
| Mobile responsive issues | High | Test cross-device înainte de merge |
| Performance slow | Medium | Lighthouse audit în QA |

---

## 7. Launch Plan

### Phase 1: Development (3-4 days)
- Day 1: Andrei - wireframes + component specs
- Day 2-3: Alex + Sorin - build components
- Day 3: Radu - integration + deploy
- Day 4: Cătălin - QA + fixes

### Phase 2: Review (1 day)
- Bogdan + User review
- Copy adjustments
- Final polish

### Phase 3: Launch
- Merge to `dev` branch
- Auto-deploy pe Railway Development
- Share link pentru feedback

### Rollback Criteria
- Critical bug care blochează navigația
- Performance score <70 pe Lighthouse
- Major visual regression pe mobile

---

## 8. Open Questions

| Question | Owner | Resolution |
|----------|-------|------------|
| Pricing amounts exacte? | User | De rafinat ulterior (placeholder OK) |
| Custom domain sau Railway subdomain? | User | Railway OK pentru dev |
| Need analytics tracking? | Bogdan | Adăugăm post-launch (Vercel Analytics?) |

---

## 9. Appendix

### Competitive References
- **Stripe.com** - gold standard pentru SaaS landing pages
- **Linear.app** - premium dark theme
- **Raycast.com** - clean, modern layout
- **Supermetrics.com** - B2B SaaS, pricing clarity

### Copy Guidelines
- Tone: Professional, confident, fără jargon inutil
- Voice: "We help you..." nu "Our platform features..."
- Romanian language (target market: RO)

---

**Approved by**: Bogdan (PM)  
**Next Step**: Andrei începe wireframes, Alex + Sorin pregătesc component structure
