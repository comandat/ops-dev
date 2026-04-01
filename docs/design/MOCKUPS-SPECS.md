# 🎨 High-Fidelity Mockups - OpenSales Homepage

**Created**: 2026-04-01  
**Author**: Andrei (UX Designer)  
**Status**: ✅ Complete - Ready for Development

---

## 📐 Mockup Overview

This document provides detailed visual specifications for each section of the homepage. All measurements are in pixels (px).

### Desktop Canvas
- **Width**: 1440px (design canvas)
- **Content Max-Width**: 1280px
- **Section Padding**: 96px vertical

### Mobile Canvas
- **Width**: 390px (iPhone 14/15 standard)
- **Content Padding**: 24px horizontal
- **Section Padding**: 64px vertical

---

## 1️⃣ Navigation

### Desktop (1440px width)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  64px Height                                                                    │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                           │  │
│  │  [Logo]                    Features    Pricing          [Login]  [CTA]    │  │
│  │  24px from left            14px reg    14px reg         14px med  14px 600│  │
│  │                              #A1A1AA    #A1A1AA          #A1A1AA  gradient│  │
│  │                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│  1px border-bottom: rgba(255,255,255,0.08)                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

Background: rgba(10, 10, 15, 0.8) with backdrop-filter: blur(12px)
Position: sticky, top: 0, z-index: 100
```

**Elements:**
- **Logo**: 32px height, text "OpenSales" in #FFFFFF, 700 weight, 20px size
- **Nav Links**: "Features", "Pricing" - 14px, 500 weight, #A1A1AA, hover #FFFFFF
- **Login Button**: 14px, 500 weight, #A1A1AA, no background
- **CTA Button**: "Începe Gratuit" - 14px, 600 weight, gradient background, 10px 20px padding, 6px radius

### Mobile (390px width)

```
┌─────────────────────────────────────┐
│  56px Height                        │
│  ┌───────────────────────────────┐  │
│  │  ☰              [Logo]  Login │  │
│  │  24px           20px bold     │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 2️⃣ Hero Section

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                              120px top padding                                  │
│                                                                                 │
│                            Accelerăm vânzările tale.                            │
│                            64px / 72px / 700 weight                             │
│                            #FFFFFF, center align                                │
│                            max-width: 800px                                     │
│                                                                                 │
│               Automatizare completă pentru Marketplace, Logistică               │
│                   și Facturare într-o singură platformă.                        │
│                            20px / 28px / 400 weight                             │
│                            #A1A1AA, center align                                │
│                            max-width: 600px                                     │
│                                                                                 │
│                              40px gap between buttons                           │
│                                                                                 │
│                    [ ÎNCEPE GRATUIT ]     [ Vezi Demo → ]                       │
│                    btn-primary (lg)       btn-secondary (lg)                    │
│                    16px 40px              16px 40px                             │
│                                                                                 │
│                              32px spacing                                       │
│                                                                                 │
│                    ✓ 14 zile trial gratuit    ✓ Fără card credit                │
│                    14px #71717A             14px #71717A                        │
│                    24px gap between items                                       │
│                                                                                 │
│                              120px bottom padding                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Visual Details:**
- Background: gradient from #0A0A0F to slightly lighter
- Checkmark icons: #10B981 (success green), 16px
- Primary button gradient: linear-gradient(135deg, #6366F1, #8B5CF6)
- Secondary button: 1px border rgba(255,255,255,0.2)

### Mobile Layout

```
┌─────────────────────────────────────┐
│  80px top padding                   │
│                                     │
│     Accelerăm vânzările tale.       │
│     40px / 48px / 700 weight        │
│                                     │
│  Automatizare completă pentru...    │
│  16px / 24px / 400 weight           │
│                                     │
│  24px gap                           │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     [ ÎNCEPE GRATUIT ]        │  │
│  │     full width, 16px 32px     │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │       [ Vezi Demo → ]         │  │
│  │     full width, 16px 32px     │  │
│  └───────────────────────────────┘  │
│                                     │
│  24px spacing                       │
│                                     │
│  ✓ 14 zile trial    ✓ Fără card    │
│  stacked vertically                 │
│                                     │
│  80px bottom padding                │
└─────────────────────────────────────┘
```

---

## 3️⃣ Stats Bar

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  48px top padding                                                               │
│                                                                                 │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐            │
│  │                              │  │                              │            │
│  │          99.9%               │  │         2,000+               │            │
│  │      48px / 700 weight       │  │      48px / 700 weight       │            │
│  │   gradient text (primary)    │  │   gradient text (primary)    │            │
│  │                              │  │                              │            │
│  │          Uptime              │  │       Comenzi/min            │            │
│  │      16px / 400 weight       │  │      16px / 400 weight       │            │
│  │         #A1A1AA              │  │         #A1A1AA              │            │
│  │                              │  │                              │            │
│  └──────────────────────────────┘  └──────────────────────────────┘            │
│                                                                                 │
│  48px bottom padding                                                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

Background: #121217 (surface color)
Each stat card: flex, items-center, justify-center
Gap between stats: 96px
```

### Mobile Layout

```
┌─────────────────────────────────────┐
│  32px padding                       │
│                                     │
│  ┌─────────────┐ ┌─────────────┐   │
│  │   99.9%     │ │   2,000+    │   │
│  │   36px      │ │   36px      │   │
│  │  Uptime     │ │ Comenzi/min │   │
│  │   14px      │ │   14px      │   │
│  └─────────────┘ └─────────────┘   │
│                                     │
│  32px padding                       │
└─────────────────────────────────────┘
```

---

## 4️⃣ Features Section

### Desktop Grid (4 columns)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  96px top padding                                                               │
│                                                                                 │
│                    Tot ce ai nevoie pentru e-commerce                           │
│                         într-o singură platformă                                │
│                    48px / 56px / 600 weight / #FFFFFF                           │
│                    max-width: 700px, center                                     │
│                                                                                 │
│  64px spacing                                                                   │
│                                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │              │ │              │ │              │ │              │          │
│  │   🛒 48px    │ │   📦 48px    │ │   💰 48px    │ │   📊 48px    │          │
│  │   #6366F1    │ │   #6366F1    │ │   #6366F1    │ │   #6366F1    │          │
│  │              │ │              │ │              │ │              │          │
│  │ Marketplace  │ │    Order     │ │   Pricing    │ │   Analytics  │          │
│  │    Sync      │ │  Management  │ │  Automation  │ │   & Reports  │          │
│  │  20px/600    │ │  20px/600    │ │  20px/600    │ │  20px/600    │          │
│  │              │ │              │ │              │ │              │          │
│  │ Sync automat │ │ Dashboard    │ │ Reguli       │ │ Rapoarte     │          │
│  │ eMAG,        │ │ unificat     │ │ dinamice     │ │ vânzări      │          │
│  │ Trendyol, FGO│ │ comenzile    │ │ prețuri      │ │ timp real    │          │
│  │ 16px/400     │ │ 16px/400     │ │ 16px/400     │ │ 16px/400     │          │
│  │ #A1A1AA      │ │ #A1A1AA      │ │ #A1A1AA      │ │ #A1A1AA      │          │
│  │              │ │              │ │              │ │              │          │
│  │              │ │              │ │              │ │              │          │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘          │
│                                                                                 │
│  96px bottom padding                                                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

Card specs:
- Background: #121217
- Border: 1px solid rgba(255,255,255,0.08)
- Border-radius: 12px
- Padding: 32px
- Gap between cards: 24px
- Hover: translateY(-2px), border-color: rgba(255,255,255,0.15)
```

### Mobile (Stacked)

```
┌─────────────────────────────────────┐
│  64px padding                       │
│                                     │
│  Tot ce ai nevoie pentru            │
│  e-commerce                         │
│  32px / 40px / 600 weight           │
│                                     │
│  48px spacing                       │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🛒                           │  │
│  │  Marketplace Sync             │  │
│  │  Sync automat eMAG, ...       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  📦                           │  │
│  │  Order Management             │  │
│  │  Dashboard unificat...        │  │
│  └───────────────────────────────┘  │
│                                     │
│  ... (repeat for all 4 cards)       │
│                                     │
│  64px padding                       │
└─────────────────────────────────────┘

Mobile card padding: 24px
Gap between cards: 16px
```

---

## 5️⃣ Pricing Section

### Desktop Grid (4 columns)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  96px top padding                                                               │
│                                                                                 │
│                       Planuri simple, fără surprize                             │
│                    48px / 56px / 600 weight / #FFFFFF                           │
│                                                                                 │
│  64px spacing                                                                   │
│                                                                                 │
│  ┌──────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────────────┐              │
│  │   FREE   │ │  STARTER ⭐  │ │   PRO    │ │   ENTERPRISE     │              │
│  │  14px    │ │  14px +badge │ │  14px    │ │      14px        │              │
│  │  #A1A1AA │ │  #A1A1AA     │ │  #A1A1AA │ │     #A1A1AA      │              │
│  │          │ │              │ │          │ │                  │              │
│  │   €0     │ │   €29        │ │   €79    │ │    Custom        │              │
│  │  48px/700│ │  48px/700    │ │  48px/700│ │    48px/700      │              │
│  │  /lună   │ │  /lună       │ │  /lună   │ │                  │              │
│  │ 16px/#717│ │ 16px/#717A   │ │16px/#717A│ │   16px/#717A     │              │
│  │          │ │              │ │          │ │                  │              │
│  ├──────────┤ ├──────────────┤ ├──────────┤ ├──────────────────┤              │
│  │ ✓ 50     │ │ ✓ 500        │ │ ✓ 2000   │ │ ✓ Unlimited      │              │
│  │ comenzi  │ │ comenzi      │ │ comenzi  │ │ comenzi          │              │
│  │          │ │              │ │          │ │                  │              │
│  │ ✓ 1 user │ │ ✓ 3 users    │ │ ✓ 10     │ │ ✓ Unlimited      │              │
│  │          │ │              │ │ users    │ │ users            │              │
│  │          │ │              │ │          │ │                  │              │
│  │ ✓ Basic  │ │ ✓ Advanced   │ │ ✓ All    │ │ ✓ Everything     │              │
│  │ sync     │ │ sync         │ │ features │ │ + Priority       │              │
│  │          │ │              │ │          │ │ support          │              │
│  │          │ │              │ │          │ │                  │              │
│  │          │ │              │ │          │ │                  │              │
│  ├──────────┤ ├──────────────┤ ├──────────┤ ├──────────────────┤              │
│  │ [Start]  │ │[Try Free]    │ │ [Start]  │ │[Contact Sales]   │              │
│  │btn-sec   │ │btn-primary   │ │btn-sec   │ │ btn-sec          │              │
│  │          │ │              │ │          │ │                  │              │
│  └──────────┘ └──────────────┘ └──────────┘ └──────────────────┘              │
│                                                                                 │
│  96px bottom padding                                                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

Popular card (Starter):
- Border: 2px solid #6366F1
- Badge: "POPULAR" - 12px, 600 weight, uppercase
- Badge background: gradient-primary
- Badge position: absolute, top: -12px, centered
```

---

## 6️⃣ Final CTA Section

### Desktop

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  96px top padding                                                               │
│                                                                                 │
│                                                                                 │
│                    Gata să-ți automatizezi vânzările?                           │
│                    40px / 48px / 700 weight / #FFFFFF                           │
│                                                                                 │
│  24px spacing                                                                   │
│                                                                                 │
│                    Începe acum - 14 zile trial gratuit                          │
│                    20px / 28px / 400 weight / #A1A1AA                           │
│                                                                                 │
│  40px spacing                                                                   │
│                                                                                 │
│                         [ ÎNCEPE GRATUIT ACUM ]                                 │
│                         btn-primary (xl) - 18px 48px                            │
│                                                                                 │
│  32px spacing                                                                   │
│                                                                                 │
│              ✓ Fără card credit      ✓ Setup în 5 minute                        │
│              14px #71717A            14px #71717A                               │
│              32px gap                                                         │
│                                                                                 │
│  96px bottom padding                                                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

Background: #121217 (surface color)
Border-radius: 16px (if card style)
Max-width: 800px, centered
```

---

## 7️⃣ Footer

### Desktop

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  64px top padding                                                               │
│                                                                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐                  │
│  │            │ │            │ │            │ │            │                  │
│  │ [Logo]     │ │ Features   │ │ Pricing    │ │ Company    │                  │
│  │ OpenSales  │ │ Marketplace│ │ Planuri    │ │ About      │                  │
│  │            │ │ Orders     │ │ Pricing    │ │ Contact    │                  │
│  │            │ │ Pricing    │ │ tiers      │ │ Legal      │                  │
│  │            │ │ Analytics  │ │            │ │ Terms      │                  │
│  │            │ │ 14px #A1AA │ │ 14px #A1AA │ │ 14px #A1AA │                  │
│  │            │ │ 24px gap   │ │ 24px gap   │ │ 24px gap   │                  │
│  │            │ │            │ │            │ │            │                  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘                  │
│                                                                                 │
│  48px spacing                                                                   │
│  ───────────────────────────────────────────────────────────────────────────    │
│  1px border rgba(255,255,255,0.08)                                              │
│  48px spacing                                                                   │
│                                                                                 │
│  Contact: hello@opensales.ro    © 2026 OpenSales. Toate drepturile rezervate.  │
│  14px #71717A                   14px #71717A                                    │
│                                                                                 │
│  32px bottom padding                                                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Behavior Summary

| Element | Desktop (>1024px) | Tablet (768-1024px) | Mobile (<768px) |
|---------|-------------------|---------------------|-----------------|
| **Nav** | Full links visible | Some links hidden | Hamburger menu |
| **Hero H1** | 64px | 48px | 40px |
| **Hero Subhead** | 20px | 18px | 16px |
| **Buttons** | Side by side | Side by side | Stacked, full-width |
| **Stats** | 4 in a row | 2 in a row | 2 in a row |
| **Features** | 4 columns | 2 columns | 1 column |
| **Pricing** | 4 columns | 2 columns | 1 column (stacked) |
| **Section Padding** | 96px | 80px | 64px |
| **Container** | 1280px max | 100% width | 100% width |

---

## 🎨 Export Checklist

**For Figma/Design Tool:**

- [ ] Create frames: Desktop (1440px), Mobile (390px)
- [ ] Set up color styles from DESIGN-SYSTEM.md
- [ ] Set up text styles from DESIGN-SYSTEM.md
- [ ] Create component variants for buttons, cards
- [ ] Build each section as separate frame
- [ ] Export as PNG @2x for documentation
- [ ] Export SVG for icons

**File naming convention:**
```
mockups/
├── hero-desktop.png
├── hero-mobile.png
├── stats-desktop.png
├── features-desktop.png
├── features-mobile.png
├── pricing-desktop.png
├── pricing-mobile.png
├── cta-desktop.png
├── cta-mobile.png
├── footer-desktop.png
└── footer-mobile.png
```

---

## ✅ Mockup Status

**Status**: ✅ Complete - All sections documented with exact measurements

**Ready for**: 
- Figma/Excalidraw implementation
- Developer handoff via COMPONENT-SPECS.md

---

**Created**: 2026-04-01  
**Next**: Component specifications for developers
