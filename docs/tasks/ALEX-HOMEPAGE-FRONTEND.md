# 💻 Alex - Frontend Tasks: Homepage (Hero + Features)

**Project**: OpenSales Homepage  
**Priority**: 🔴 High (Day 2-3)  
**PRD Reference**: `docs/PRD-HOMEPAGE.md`  
**Design Handoff**: Andrei (`docs/design/COMPONENT-SPECS.md`)

---

## 📋 Overview

Ești responsabil de implementarea **Hero Section** și **Features Section**. 
Lucrează în parallel cu Sorin (Pricing + Footer).

---

## ✅ Task List

### Task 1: Setup Project Structure (30 min)
- [ ] Checkout branch `dev`
- [ ] Creează folder `/frontend/src/app/(marketing)/`
- [ ] Creează folder `/frontend/src/components/marketing/`
- [ ] Setup layout.tsx pentru (marketing) route group (fără auth)
- [ ] Verifică că Tailwind e configurat corect

### Task 2: Create Base Components (2 ore)
- [ ] `Hero.tsx` - componentă principală hero
- [ ] `StatsBar.tsx` - stats badges (99.9% uptime, 2k+ comenzi/min)
- [ ] `FeatureCard.tsx` - card reutilizabil pentru features
- [ ] `FeaturesGrid.tsx` - grid layout pentru 4 features

### Task 3: Implement Hero Section (2-3 ore)
- [ ] Headline: "Accelerăm vânzările tale."
- [ ] Subheadline: "Automatizare completă pentru Marketplace, Logistică și Facturare."
- [ ] CTA Primary: "Începe Gratuit" (link la /register)
- [ ] CTA Secondary: "Vezi Demo" (scroll la features sau modal)
- [ ] Background: gradient/subtle pattern (conform design Andrei)
- [ ] Responsive: mobile stack, desktop side-by-side

### Task 4: Implement Stats Bar (1 hour)
- [ ] 2-4 stats badges
- [ ] Iconițe + number + label
- [ ] Layout: flex row (desktop), flex col (mobile)
- [ ] Animație subtilă la hover (optional)

### Task 5: Implement Features Section (3-4 ore)
- [ ] 4 feature cards:
  1. **Marketplace Sync** - eMAG, Trendyol, FGO integration
  2. **Order Management** - unified dashboard
  3. **Pricing Automation** - dynamic rules
  4. **Analytics & Reporting** - insights
- [ ] Fiecare card: icon + title + description (2-3 rânduri)
- [ ] Grid layout: 2x2 desktop, 1x4 mobile
- [ ] Hover effects (subtle lift, shadow)
- [ ] Follow design specs from Andrei

### Task 6: Integration & Polish (1-2 ore)
- [ ] Importă componentele în `page.tsx`
- [ ] Asigură-te că spacing e consistent
- [ ] Verifică responsive pe mobile (devtools)
- [ ] Add smooth scroll (css scroll-behavior: smooth)
- [ ] Test local: `npm run dev`

### Task 7: Code Quality (30 min)
- [ ] TypeScript types pentru props
- [ ] Componente reutilizabile (nu hardcode values)
- [ ] Tailwind classes organizate (nu spaghetti)
- [ ] Comments pentru logică complexă
- [ ] Run linter: `npm run lint`

---

## 📁 File Structure

```
frontend/src/
├── app/
│   └── (marketing)/
│       ├── layout.tsx
│       └── page.tsx
└── components/
    └── marketing/
        ├── Hero.tsx
        ├── StatsBar.tsx
        ├── FeatureCard.tsx
        └── FeaturesGrid.tsx
```

---

## 🎯 Acceptance Criteria

- [ ] Hero section arată exact ca design-ul lui Andrei
- [ ] Features grid e responsive (mobile + desktop)
- [ ] CTA buttons funcționale (link la /register)
- [ ] No console errors
- [ ] Lighthouse score >90 (Performance)
- [ ] Mobile-first: arată bine pe 375px width
- [ ] Code e clean și reutilizabil

---

## 💡 Tips

- **Follow design specs** - nu improviza culori/spacing
- **Component-driven** - fă componentele reutilizabile
- **Mobile first** - testează des pe mobile viewport
- **Performance** - nu adăuga dependencies inutile
- **Collaborate** - vorbește cu Andrei dacă ceva nu e clar

---

## 🔗 Dependencies

- **Blocked by**: Andrei (design specs)
- **Parallel with**: Sorin (Pricing + Footer)
- **Blocks**: Radu (integration), Cătălin (QA)

---

**Start**: După ce Andrei finalizează design-ul  
**ETA**: End of Day 2  
**Review**: Bogdan + Andrei
