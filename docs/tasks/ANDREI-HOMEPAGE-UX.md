# 🎨 Andrei - UX Tasks: Homepage

**Project**: OpenSales Homepage  
**Priority**: 🔴 High (Day 1)  
**PRD Reference**: `docs/PRD-HOMEPAGE.md`

---

## 📋 Overview

Trebuie să creezi design-ul și specificațiile UI pentru homepage. Focus pe **premium look & feel**, modern, intuitiv.

---

## ✅ Task List

### Task 1: Research & Referințe (1-2 ore)
- [ ] Analizează 3-4 landing pages de referință:
  - https://stripe.com (hero + features)
  - https://linear.app (dark theme premium)
  - https://raycast.com (clean layout)
  - https://supermetrics.com (B2B SaaS pricing)
- [ ] Creează moodboard cu elemente care îți plac (culori, spacing, typography)
- [ ] Documentează într-un fișier `docs/design/REFERENCES.md`

### Task 2: Wireframe Low-Fidelity (2-3 ore)
- [ ] Schițează structura homepage-ului (Figma sauExcalidraw)
- [ ] Definește flow-ul vizual: Hero → Stats → Features → Pricing → CTA → Footer
- [ ] Asigură-te că ierarhia e clară (ce vede user-ul first, second, third)
- [ ] Salvează wireframe în `docs/design/wireframe-homepage.png`

### Task 3: Design System Setup (1-2 ore)
- [ ] Definește color palette (dark theme base + accent gradients)
  - Background: dark (ex: #0A0A0F sau similar)
  - Text: white/gray hierarchy
  - Accent: albastru/violet gradient (consistent cu login page)
- [ ] Typography scale (headline, subheadline, body, small)
- [ ] Button styles (primary, secondary, sizes)
- [ ] Card styles (features, pricing)
- [ ] Salvează în `docs/design/DESIGN-SYSTEM.md`

### Task 4: High-Fidelity Mockups (3-4 ore)
- [ ] Design Hero Section (desktop + mobile)
- [ ] Design Stats Bar
- [ ] Design Features Grid (4 cards)
- [ ] Design Pricing Section (4 cards)
- [ ] Design CTA Section
- [ ] Design Footer
- [ ] Exportă ca PNG în `docs/design/mockups/`

### Task 5: Component Specs pentru Developeri (2 ore)
- [ ] Pentru fiecare componentă, scrie specificații clare:
  - Dimensions (width, height, padding, margin)
  - Colors (hex codes)
  - Typography (font-size, weight, line-height)
  - Spacing (Tailwind classes sugerate)
  - Hover states
  - Responsive breakpoints
- [ ] Creează fișier `docs/design/COMPONENT-SPECS.md`

### Task 6: Handoff Meeting (30 min)
- [ ] Prezintă design-ul lui Alex + Sorin
- [ ] Explică deciziile de design
- [ ] Răspunde la întrebări
- [ ] Disponibil pentru clarificări în timpul implementării

---

## 📁 Deliverables Location

```
ops-dev/docs/design/
├── REFERENCES.md
├── DESIGN-SYSTEM.md
├── COMPONENT-SPECS.md
├── wireframe-homepage.png
└── mockups/
    ├── hero-desktop.png
    ├── hero-mobile.png
    ├── features.png
    ├── pricing.png
    ├── cta.png
    └── footer.png
```

---

## 🎯 Acceptance Criteria

- [ ] Design arată **premium** (nu generic/template)
- [ ] Dark theme consistent cu existing login page
- [ ] Mobile-first approach (responsive design gândit de la început)
- [ ] Typography hierarchy clară
- [ ] CTA buttons vizibile și atractive
- [ ] Pricing cards easy to compare
- [ ] Specificații clare pentru developeri (nu ambiguități)

---

## 💡 Tips

- **Whitespace is your friend** - nu înghesui elementele
- **Contrast** - asigură-te că textul e lizibil pe dark background
- **Consistency** - folosește aceeași spacing scale peste tot
- **Premium feel** - gradients, subtle shadows, smooth corners

---

**Start**: ASAP  
**ETA**: End of Day 1  
**Blocked by**: None  
**Blocks**: Alex + Sorin (Frontend implementation)
