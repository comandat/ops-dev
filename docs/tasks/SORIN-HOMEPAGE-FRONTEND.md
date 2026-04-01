# 💻 Sorin - Frontend Tasks: Homepage (Pricing + Footer)

**Project**: OpenSales Homepage  
**Priority**: 🔴 High (Day 2-3)  
**PRD Reference**: `docs/PRD-HOMEPAGE.md`  
**Design Handoff**: Andrei (`docs/design/COMPONENT-SPECS.md`)

---

## 📋 Overview

Ești responsabil de implementarea **Pricing Section** și **Footer**. 
Lucrează în parallel cu Alex (Hero + Features).

---

## ✅ Task List

### Task 1: Setup Project Structure (30 min)
- [ ] Checkout branch `dev`
- [ ] Coordonează cu Alex pentru structura folderelor
- [ ] Verifică că ai acces la design specs de la Andrei

### Task 2: Create Base Components (2 ore)
- [ ] `PricingCard.tsx` - card reutilizabil pentru pricing tiers
- [ ] `PricingSection.tsx` - container pentru toate pricing cards
- [ ] `CtaSection.tsx` - final CTA before footer
- [ ] `Footer.tsx` - footer cu links

### Task 3: Implement Pricing Section (3-4 ore)
- [ ] 4 pricing tiers:
  1. **Free** - 0€/lună (pentru început/testing)
  2. **Starter** - 29€/lună (placeholder, de rafinat)
  3. **Pro** - 79€/lună (placeholder, de rafinat)
  4. **Enterprise** - Custom (contact sales)
- [ ] Fiecare card:
  - Plan name
  - Price (large, prominent)
  - Features list (5-7 bullet points)
  - CTA button
  - "Most popular" badge pentru Pro (optional)
- [ ] Highlight vizual pentru tier-ul recomandat (Pro)
- [ ] Responsive: 4-col desktop, 2x2 tablet, 1x4 mobile
- [ ] Toggle lunar/anual (optional, v2)

### Task 4: Implement CTA Section (1 hour)
- [ ] Headline: "Gata să începi?"
- [ ] Subheadline: "14 zile trial gratuit. Nu necesită card de credit."
- [ ] CTA Button: "Începe Acum"
- [ ] Background: gradient sau contrast față de pricing
- [ ] Spacing generos (whitespace)

### Task 5: Implement Footer (1-2 ore)
- [ ] 3-4 columns:
  1. **Brand** - logo + tagline scurt
  2. **Links** - Features, Pricing, About
  3. **Legal** - Terms, Privacy, Cookies
  4. **Contact** - email, social links (optional)
- [ ] Copyright text: "© 2026 OpenSales. Toate drepturile rezervate."
- [ ] Responsive: stack pe mobile
- [ ] Darker background decât restul page-ului

### Task 6: Integration & Polish (1-2 ore)
- [ ] Importă componentele în `page.tsx` (coordonează cu Alex)
- [ ] Verifică spacing între secțiuni
- [ ] Add smooth scroll anchors (pricing, features)
- [ ] Test local: `npm run dev`

### Task 7: Code Quality (30 min)
- [ ] TypeScript types pentru props
- [ ] Componente reutilizabile
- [ ] Tailwind classes organizate
- [ ] Run linter: `npm run lint`

---

## 📁 File Structure

```
frontend/src/
├── app/
│   └── (marketing)/
│       └── page.tsx (shared with Alex)
└── components/
    └── marketing/
        ├── PricingCard.tsx
        ├── PricingSection.tsx
        ├── CtaSection.tsx
        └── Footer.tsx
```

---

## 🎯 Acceptance Criteria

- [ ] Pricing cards arată exact ca design-ul lui Andrei
- [ ] "Most popular" tier e vizibil highlight-ed
- [ ] Footer arată professional (nu înghesuit)
- [ ] Responsive pe toate device-urile
- [ ] No console errors
- [ ] Lighthouse score >90 (Performance)
- [ ] Code e clean și reutilizabil

---

## 💡 Tips

- **Pricing clarity** - user-ul trebuie să poată compara ușor planurile
- **Highlight recommended tier** - ghidează user-ul spre Pro
- **Footer nu e afterthought** - e parte din brand experience
- **Collaborate** - vorbește cu Alex pentru consistency

---

## 🔗 Dependencies

- **Blocked by**: Andrei (design specs)
- **Parallel with**: Alex (Hero + Features)
- **Blocks**: Radu (integration), Cătălin (QA)

---

**Start**: După ce Andrei finalizează design-ul  
**ETA**: End of Day 2  
**Review**: Bogdan + Andrei
